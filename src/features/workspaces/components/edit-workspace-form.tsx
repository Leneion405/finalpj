"use client";

import { z } from "zod";
import Image from "next/image";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { updateWorkspaceSchema } from "../schemas";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useResetInviteCode } from "../api/use-reset-invite-code";
import { DottedSeparator } from "@/components/dotted-separator";

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({
  onCancel,
  initialValues,
}: EditWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();
  const { mutate: resetInviteCode, isPending: isResettingInviteCode } =
    useResetInviteCode();

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset Invite Link",
    "This will invalidate the current invite link",
    "destructive"
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",
    },
  });

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) return;

    resetInviteCode({ param: { workspaceId: initialValues.$id } });
  };

  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };

    mutate({ form: finalValues, param: { workspaceId: initialValues.$id } });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success("Invite link copied to clipboard."));
  };

  return (
    <div className="w-full h-auto max-w-full">
      <ResetDialog />
      
      {/* Edit Workspace Section */}
      <div className="mb-8">
        <h3 className="text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-4">
          Edit Workspace
        </h3>
          <DottedSeparator className="my-6" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Workspace Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm font-medium">
                    Workspace name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Engineering Cores"
                      className="!h-[48px] disabled:opacity-90 disabled:pointer-events-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TODO: Implement description field later */}
            {/* Workspace Description */}
            {/* <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm font-medium">
                    Workspace description
                    <span className="text-xs font-extralight ml-2 text-muted-foreground">
                      Optional
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Our team organizes marketing projects and tasks here."
                      className="resize-none disabled:opacity-90 disabled:pointer-events-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Workspace Icon */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm font-medium">
                    Workspace Icon
                  </FormLabel>
                  <div className="flex items-center gap-x-5">
                    {field.value ? (
                      <div className="size-[72px] relative rounded-md overflow-hidden">
                        <Image
                          alt="Logo"
                          fill
                          className="object-cover"
                          src={
                            field.value instanceof File
                              ? URL.createObjectURL(field.value)
                              : field.value
                          }
                        />
                      </div>
                    ) : (
                      <Avatar className="size-[72px]">
                        <AvatarFallback>
                          <ImageIcon className="size-[36px] text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG, SVG or JPEG, max 1MB
                      </p>
                      <input
                        className="hidden"
                        type="file"
                        accept=".jpg, .png, .jpeg, .svg"
                        ref={inputRef}
                        onChange={handleImageChange}
                        disabled={isPending}
                      />
                      {field.value ? (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant="destructive"
                          size="sm"
                          className="w-fit mt-2"
                          onClick={() => {
                            field.onChange(null);
                            if (inputRef.current) {
                              inputRef.current.value = "";
                            }
                          }}
                        >
                          Remove Image
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant="outline"
                          size="sm"
                          className="w-fit mt-2"
                          onClick={() => inputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                disabled={isPending}
                type="submit"
                className="h-[40px] text-white font-semibold"
              >
                {isPending && <div className="animate-spin mr-2">⏳</div>}
                Update Workspace
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <Separator className="my-6" />

      {/* Invite Members Section */}
      <div className="mb-8">
        <h3 className="text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-4">
          Invite Members
        </h3>
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-4">
              Use the invite link to add members to your workspace.
            </p>
            <div className="flex items-center gap-x-2 mb-4">
              <Input 
                disabled 
                value={fullInviteLink} 
                className="font-mono text-sm"
              />
              <Button
                onClick={handleCopyInviteLink}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <CopyIcon className="size-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                size="sm"
                variant="destructive"
                type="button"
                disabled={isResettingInviteCode}
                onClick={handleResetInviteCode}
              >
                {isResettingInviteCode && <div className="animate-spin mr-2">⏳</div>}
                Reset Invite Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
