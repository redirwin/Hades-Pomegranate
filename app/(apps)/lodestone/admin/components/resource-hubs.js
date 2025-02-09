"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import ResourceHubForm from "./resource-hub-form";

export default function ResourceHubs({ isFormOpen, setIsFormOpen }) {
  const [editingHub, setEditingHub] = useState(null);

  // Temporary mock data
  const hubs = [
    {
      id: 1,
      name: "Forest Loot",
      image: "/placeholder.jpg",
      provisionCount: 12,
      upperPriceModifier: 20,
      lowerPriceModifier: 20,
      minProvisions: 1,
      maxProvisions: 5,
      selectedProvisions: [1, 2]
    },
    {
      id: 2,
      name: "Dungeon Treasures",
      image: "/placeholder.jpg",
      provisionCount: 8,
      upperPriceModifier: 30,
      lowerPriceModifier: 10,
      minProvisions: 2,
      maxProvisions: 6,
      selectedProvisions: [2, 3]
    }
  ];

  const handleEdit = (hub) => {
    setEditingHub(hub);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHub(null);
  };

  return (
    <>
      <div className="space-y-4">
        {hubs.map((hub) => (
          <Card key={hub.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{hub.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Contains {hub.provisionCount} Provisions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(hub)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
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
