import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { loginAPI } from "@/api/auth";
import CustomError from "@/lib/CustomError";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

interface LoginModalProps {
  onClose: () => void;
  setType: (type: "login" | "signup") => void;
}

export const LoginModal = ({ onClose, setType }: LoginModalProps) => {
  // states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  // form creation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { email, password } = values;
      const data = await loginAPI(email, password);
      login(data.token, data.user);
      toast.success("Logged in successfully!");
      onClose();
    } catch (err) {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong!");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function typeChange() {
    setType("signup");
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3"
    >
      <div className="mb-4">
        <div className="flex flex-row justify-between items-start mb-3">
          <h2 className="text-2xl font-bold mb-3">Login</h2>
          <Button
            disabled={isLoading}
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-8 w-full items-center"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Your password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoading ? (
              <Button disabled type="submit" className="w-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Wait</span>
              </Button>
            ) : (
              <Button type="submit" className="w-1/2">
                Submit
              </Button>
            )}
          </form>
        </Form>
      </div>
      <div className="flex flex-row text-right">
        <div className="flex flex-row items-center text-left">
          <p>Don't have an account?</p>

          <Button disabled={isLoading} onClick={typeChange} variant="link">
            SignUp
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
