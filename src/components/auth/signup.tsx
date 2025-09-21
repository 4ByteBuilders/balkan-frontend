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
import { loginAPI, registerAPI } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import CustomError from "@/lib/CustomError";

const formSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
});

interface SignUpModalProps {
  onClose: () => void;
  setType: (type: "login" | "signup") => void;
}

export const SignUpModal = ({ onClose, setType }: SignUpModalProps) => {
  // states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  // form creation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { name, email, password } = values;

      await registerAPI(name, email, password);
      toast.success("Registered successfully!");

      toast.loading("Logging in...");
      const data = await loginAPI(email, password);

      login(data.token, data.user);
      toast.dismiss();
      toast.success("Logged in successfully!");
      onClose();
    } catch (err) {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function typeChange() {
    setType("login");
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
          <h2 className="text-2xl font-bold mb-3">SignUp</h2>
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
            className="flex flex-col items-center space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
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
          <p>Already have an account?</p>
          <Button disabled={isLoading} onClick={typeChange} variant="link">
            Login
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
