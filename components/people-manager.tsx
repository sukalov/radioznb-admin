'use client'

import { useState, useEffect, useTransition, useMemo, useRef, FC } from 'react'
import { toast } from 'sonner'
import { Edit, Trash } from 'lucide-react'
import {
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
} from '@/lib/actions'
import type { Person } from '@/db/schema'
import AddButton from '@/components/add-button'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useSession } from 'next-auth/react'
import { useFilters } from '@/contexts/filter-context'

export function PeopleManager() {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    telegramAccount: '',
  })
  const user = useSession({ required: true })
  const { filters } = useFilters()
  const formRef = useRef<HTMLDivElement>(null)

  const loadPeople = async () => {
    setIsLoading(true)
    try {
      const result = await getPeople()
      if (result.success) {
        setPeople(result.data!)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.log(error)
      toast.error('не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPeople()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const telegramAccount = formData.telegramAccount.replace(/^@/, '')

        if (editingId) {
          const result = await updatePerson(editingId, {
            name: formData.name.toLowerCase(),
            telegramAccount: telegramAccount || null,
          })
          if (result.success) {
            toast.success('человек обновлён')
            setEditingId(null)
            setIsCreating(false)
            await loadPeople()
          } else {
            toast.error(result.error)
          }
        } else {
          const result = await createPerson({
            name: formData.name.toLowerCase(),
            telegramAccount: telegramAccount || undefined,
          })
          if (result.success) {
            toast.success('человек добавлен')
            setIsCreating(false)
            await loadPeople()
          } else {
            toast.error(result.error)
          }
        }

        setFormData({ name: '', telegramAccount: '' })
      } catch (error) {
        console.log(error)
        toast.error('не удалось сохранить изменения')
      }
    })
  }

  const handleEdit = (person: Person) => {
    setEditingId(person.id)
    setFormData({
      name: person.name,
      telegramAccount: person.telegramAccount || '',
    })
    setIsCreating(true)

    setTimeout(() => {
      if (formRef.current) {
        const yOffset = -320
        const y =
          formRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 100)
  }

  const handleDelete = async (id: string) => {
    if (confirm('вы уверены, что хотите удалить этого человека?')) {
      startTransition(async () => {
        try {
          const result = await deletePerson(id)
          if (result.success) {
            toast.success('человек удалён')
            await loadPeople()
          } else {
            toast.error(result.error)
          }
        } catch (error) {
          console.log(error)
          toast.error('не удалось удалить человека')
        }
      })
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({ name: '', telegramAccount: '' })
  }

  const getTelegramUrl = (username: string) => `https://t.me/${username}`

  const filteredPeople = useMemo(() => {
    let result = [...people]

    if (filters.searchQuery) {
      const query = filters.searchQuery
        .toLowerCase()
        .replace(/[^а-я]/g, '')
        .replace('ё', 'е')
      result = result.filter(
        (person) =>
          person.name
            .toLowerCase()
            .replace('ё', 'е')
            .replace(/[^а-я]/g, '')
            .includes(query) ||
          person.telegramAccount
            ?.toLowerCase()
            .replace('ё', 'е')
            .replace(/[^а-я]/g, '')
            .includes(query),
      )
    }

    if (!filters.peopleWithTelegram && !filters.peopleWithoutTelegram) {
      result = []
    } else if (!filters.peopleWithTelegram) {
      result = result.filter((person) => !person.telegramAccount)
    } else if (!filters.peopleWithoutTelegram) {
      result = result.filter((person) => person.telegramAccount)
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'ru')
        case 'name-desc':
          return b.name.localeCompare(a.name, 'ru')
        case 'date-asc':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'date-desc':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          return 0
      }
    })

    return result
  }, [people, filters])

  if (isLoading) {
    return <div className="p-6">загрузка людей...</div>
  }

  const formProps = {
    formRef,
    editingId,
    handleSubmit,
    formData,
    setFormData,
    isPending,
    handleCancel,
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold pl-4">люди (ведущие и гости)</h2>
        <AddButton
          onClick={() => {
            handleCancel()
            setIsCreating(true)
          }}
        />
      </div>

      {isCreating && !editingId && <Form {...formProps} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map((person) => (
          <div key={person.id} className="border rounded-lg p-4 h-fit">
            {isCreating && editingId === person.id ? (
              <Form {...formProps} />
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{person.name}</h3>
                  {person.telegramAccount && (
                    <p className="text-muted-foreground text-sm mt-1">
                      <a
                        href={getTelegramUrl(person.telegramAccount)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover/80"
                      >
                        @{person.telegramAccount}
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex space-x-3 ml-4">
                  <button
                    onClick={() => handleEdit(person)}
                    className="text-primary hover:text-primary-hover/80"
                    disabled={isPending}
                  >
                    <Edit />
                  </button>
                  {user.data?.user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                      disabled={isPending}
                    >
                      <Trash />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredPeople.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {people.length === 0
              ? 'нет добавленных людей. создайте первого ведущего или гостя!'
              : 'нет людей, соответствующих фильтрам'}
          </p>
        )}
      </div>
    </div>
  )
}

const Form: FC<any> = ({
  formRef,
  editingId,
  handleSubmit,
  formData,
  setFormData,
  isPending,
  handleCancel,
}) => {
  return (
    <div
      ref={formRef}
      className={`${!editingId && 'mb-6 p-4 border rounded-lg bg-gray-50'}`}
    >
      <h3 className="text-lg font-medium mb-4">
        {editingId ? formData.name : 'новый человек'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            имя *
          </label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            аккаунт в телеграме
          </label>
          <Input
            type="text"
            value={formData.telegramAccount}
            onChange={(e) =>
              setFormData({
                ...formData,
                telegramAccount: e.target.value,
              })
            }
            placeholder="username (без @)"
          />
        </div>
        <div className="flex space-x-2">
          <Button type="submit" disabled={isPending} variant="default">
            {editingId ? 'обновить' : 'создать'}
          </Button>
          <Button type="button" onClick={handleCancel} variant="outline">
            отмена
          </Button>
        </div>
      </form>
    </div>
  )
}
