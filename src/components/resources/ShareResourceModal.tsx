import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Object, Role } from "@/lib/interfaces";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceToShare: Object | null;
  onShare: (email: string, role: Role) => void;
  isSharing: boolean;
}

export const ShareResourceModal = ({
  isOpen,
  onClose,
  resourceToShare,
  onShare,
  isSharing,
}: ShareResourceModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");

  if (!resourceToShare) return null;

  const shareLink = `${window.location.origin}/file/${resourceToShare.shareToken}`;

  const handleCopyLink = () => {
    if (!resourceToShare.shareToken) {
      toast.error("This resource does not have a share link.");
      return;
    }
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  const handleShareViaEmail = () => {
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    onShare(email, role);
    setEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share "{resourceToShare.name}"</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this resource.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="share-link">Copy Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={
                  resourceToShare.shareToken
                    ? shareLink
                    : "Sharing not available for this item."
                }
                readOnly
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                disabled={!resourceToShare.shareToken}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          Select
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Share with a user</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Select
                value={role}
                onValueChange={(value: Role) => setRole(value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleShareViaEmail}
                disabled={!email || isSharing}
              >
                {isSharing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
