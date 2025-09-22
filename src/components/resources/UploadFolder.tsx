import { motion } from "framer-motion";
import { Upload, Loader2, X } from "lucide-react";
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

interface UploadFileModalProps {
  uploadFile: (file: File) => Promise<void>;
  toggle: (setToggle: boolean) => void;
}

const formSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, { message: "A file is required" }),
});

export const UploadFileModal = ({
  uploadFile,
  toggle,
}: UploadFileModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.file) return;
    setLoading(true);
    await uploadFile(values.file);
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
          <span>Upload File</span>
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
              name="file"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Select File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loading ? (
              <Button type="submit" disabled>
                <Loader2 className="animate-spin" />
                <span>Uploading...</span>
              </Button>
            ) : (
              <Button type="submit">
                <Upload />
                <span>Upload</span>
              </Button>
            )}
          </form>
        </Form>
      </div>
    </motion.div>
  );
};
