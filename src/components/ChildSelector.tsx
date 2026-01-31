import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ChildSelector = () => {
  const { children, selectedChild, setSelectedChild, profile, refreshChildren } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const canAddMore = children.length < 3;

  const handleAddChild = async () => {
    if (!newChildName.trim() || !profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("children").insert({
        parent_id: profile.id,
        child_name: newChildName.trim(),
      });

      if (error) {
        if (error.message.includes("row-level security")) {
          toast({
            title: "לא ניתן להוסיף ילד",
            description: "הגעת למקסימום של 3 ילדים",
            variant: "destructive",
          });
        } else {
          toast({
            title: "שגיאה",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "הילד נוסף בהצלחה! 🎉",
        description: `${newChildName} נוסף למערכת`,
      });

      setNewChildName("");
      setShowAddDialog(false);
      await refreshChildren();
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedChild) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 text-lg font-bold">
            <span>👦</span>
            {selectedChild.child_name}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {children.map((child) => (
            <DropdownMenuItem
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`cursor-pointer ${
                child.id === selectedChild.id ? "bg-accent" : ""
              }`}
            >
              <span className="ml-2">👦</span>
              {child.child_name}
            </DropdownMenuItem>
          ))}
          
          {canAddMore && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowAddDialog(true)}
                className="cursor-pointer text-primary"
              >
                <Plus className="h-4 w-4 ml-2" />
                הוסף ילד
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף ילד חדש</DialogTitle>
            <DialogDescription>
              ניתן להוסיף עד 3 ילדים למשפחה ({children.length}/3)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newChildName">שם הילד/ה</Label>
              <Input
                id="newChildName"
                placeholder="למשל: שירה"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              ביטול
            </Button>
            <Button
              onClick={handleAddChild}
              disabled={!newChildName.trim() || isLoading}
              className="coin-gradient text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "הוסף"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
