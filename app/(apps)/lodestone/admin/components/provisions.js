"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import ProvisionForm from "./provision-form";
import { useRarity } from "../../context/RarityContext";

export default function Provisions({ isFormOpen, setIsFormOpen }) {
  const { rarityOptions } = useRarity();
  const [editingProvision, setEditingProvision] = useState(null);

  // Temporary mock data
  const provisions = [
    {
      id: 1,
      name: "Health Potion",
      image: "/placeholder.jpg",
      rarity: "Common",
      basePrice: 50,
      selectedHubs: [1, 2]
    },
    {
      id: 2,
      name: "Ancient Scroll",
      image: "/placeholder.jpg",
      rarity: "Rare",
      basePrice: 200,
      selectedHubs: [2]
    },
    {
      id: 3,
      name: "Legendary Sword",
      image: "/placeholder.jpg",
      rarity: "Legendary",
      basePrice: 1000,
      selectedHubs: [1, 2, 3]
    }
  ];

  const rarityColors = {
    Junk: "text-gray-500",
    Common: "text-green-600",
    Uncommon: "text-cyan-600",
    Rare: "text-blue-600",
    "Very Rare": "text-purple-600",
    Legendary: "text-yellow-600",
    Artifact: "text-red-600",
    Wondrous: "text-fuchsia-600",
    Varies: "text-orange-600"
  };

  const handleEdit = (provision) => {
    setEditingProvision(provision);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProvision(null);
  };

  return (
    <>
      <div className="space-y-4">
        {provisions.map((provision) => (
          <Card key={provision.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{provision.name}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={rarityColors[provision.rarity]}>
                      {provision.rarity}
                    </span>
                    <span className="text-muted-foreground">
                      {provision.basePrice.toFixed(2)} gold
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(provision)}
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

      <ProvisionForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        initialData={editingProvision}
      />
    </>
  );
}
