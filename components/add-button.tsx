import { Plus } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";
import { Button } from "@/components/ui/button";

const AddButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <Button {...props} className="aspect-square p-2">
    <div className="flex gap-1 items-center justify-center">
      <Plus />
      <div className="hidden md:block">добавить</div>
    </div>
  </Button>
);

export default AddButton;
