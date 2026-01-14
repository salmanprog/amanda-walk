import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Pet {
  id: string;
  petName: string;
  petGender: string;
  petBreed: string;
  PetWeight: string;
  petColor: string;
  petType: string;
  birthday: Date | null;
}

interface PetsState {
  pets: Pet[];
  selectedPetIds: string[];

  addPet: (pet: Pet) => void;
  removePet: (id: string) => void;
  togglePetSelection: (id: string) => void;
  clearSelection: () => void;
}

export const usePetsStore = create<PetsState>()(
  persist(
    (set, get) => ({
      pets: [],
      selectedPetIds: [],

      addPet: (pet) =>
        set((state) => ({
          pets: [...state.pets, pet],
        })),

      removePet: (id) =>
        set((state) => ({
          pets: state.pets.filter((p) => p.id !== id),
          selectedPetIds: state.selectedPetIds.filter((pid) => pid !== id),
        })),

      togglePetSelection: (id) => {
        const selected = get().selectedPetIds;

        if (selected.includes(id)) {
          set({
            selectedPetIds: selected.filter((pid) => pid !== id),
          });
        } else {
          set({
            selectedPetIds: [...selected, id],
          });
        }
      },

      clearSelection: () => set({ selectedPetIds: [] }),
    }),
    {
      name: "pets-storage",
    }
  )
);
