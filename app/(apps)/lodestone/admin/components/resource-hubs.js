"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ResourceHubForm from "./resource-hub-form";
import { useResourceHubs } from "../../context/ResourceHubContext";
import { deleteImage } from "../../firebase/storage";

export default function ResourceHubs({ isFormOpen, setIsFormOpen }) {
  const { resourceHubs, deleteResourceHub, loading, error } = useResourceHubs();
  const [editingHub, setEditingHub] = useState(null);
  const { toast } = useToast();

  const handleEdit = (hub) => {
    setEditingHub(hub);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const hub = resourceHubs.find((h) => h.id === id);
      if (hub?.imageUrl) {
        await deleteImage(hub.imageUrl);
      }
      await deleteResourceHub(id);
      toast({
        title: "Success",
        description: "Resource hub deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resource hub",
        variant: "destructive"
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHub(null);
  };

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading resource hubs...</div>
    );
  }

  if (error) {
    return <div className="text-destructive">Error loading resource hubs</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {resourceHubs.map((hub) => (
          <Card key={hub.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  {hub.imageUrl ? (
                    <img
                      src={hub.imageUrl}
                      alt={hub.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{hub.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{hub.provisionCount} provisions</span>
                    <span>•</span>
                    <span>
                      {hub.minProvisions}-{hub.maxProvisions} per refresh
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(hub)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(hub.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ResourceHubForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        initialData={editingHub}
      />
    </>
  );
}
