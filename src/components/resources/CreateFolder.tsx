import { motion } from "framer-motion";
import { BadgePlus, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";

interface CreateFolderModalProps {
  createFolder: (name: string) => Promise<void>;
  toggle: (setToggle: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1).max(30),
});

export const CreateFolderModal = ({
  createFolder,
  toggle,
}: CreateFolderModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await createFolder(values.name);
    setLoading(false);
    toggle(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="flex flex-col gap-3 bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
        {/* top bar */}
        <div className="flex flex-row items-center justify-between">
          <span>Create Folder</span>
          <Button variant={"secondary"} onClick={() => toggle(false)}>
            <X />
          </Button>
        </div>
        {/* form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Folder Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loading ? (
              <Button type="submit" disabled={true}>
                <Loader2 className="animate-spin" />
                <span>Creating...</span>
              </Button>
            ) : (
              <Button type="submit">
                <BadgePlus />
                <span>Create</span>
              </Button>
            )}
          </form>
        </Form>
      </div>
    </motion.div>
  );
};
