export async function GET() {
  const { B2_ACCOUNT_ID, B2_APP_KEY, B2_BUCKET_ID } = process.env
  if (!B2_ACCOUNT_ID || !B2_APP_KEY || !B2_BUCKET_ID) {
    return Response.json(
      { error: 'Missing Backblaze env vars' },
      { status: 500 },
    )
  }

  // 1️⃣ Authorize account
  const authHeader = 'Basic ' + btoa(`${B2_ACCOUNT_ID}:${B2_APP_KEY}`)

  const authResp = await fetch(
    'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
    {
      headers: { Authorization: authHeader },
    },
  )

  if (!authResp.ok) {
    const text = await authResp.text()
    return Response.json(
      { error: 'Auth failed', details: text },
      { status: 500 },
    )
  }

  const authData = await authResp.json()

  // 2️⃣ Get upload URL
  const uploadResp = await fetch(
    `${authData.apiUrl}/b2api/v2/b2_get_upload_url`,
    {
      method: 'POST',
      headers: {
        Authorization: authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
    },
  )

  if (!uploadResp.ok) {
    const text = await uploadResp.text()
    return Response.json(
      { error: 'Failed to get upload URL', details: text },
      { status: 500 },
    )
  }

  const uploadData = await uploadResp.json()

  // 3️⃣ Return upload URL and token to client
  return Response.json({
    uploadUrl: uploadData.uploadUrl,
    authorizationToken: uploadData.authorizationToken,
  })
}
