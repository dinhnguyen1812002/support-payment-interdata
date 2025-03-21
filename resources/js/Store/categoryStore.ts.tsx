// categoryStore.ts
import { Category } from '@/types';
import { create } from 'zustand';


type CategoryState = {
    data: Category[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    searchTerm: string;
    deleteDialogOpen: boolean;
    categoryToDelete: Category | null;
    categoryDialogOpen: boolean;
    categoryToEdit: Category | null;
    isLoading: boolean;
};

type CategoryActions = {
    setData: (data: Category[]) => void;
    setPagination: (pagination: CategoryState['pagination']) => void;
    setSearchTerm: (term: string) => void;
    setDeleteDialogOpen: (open: boolean) => void;
    setCategoryToDelete: (category: Category | null) => void;
    setCategoryDialogOpen: (open: boolean) => void;
    setCategoryToEdit: (category: Category | null) => void;
    setIsLoading: (isLoading: boolean) => void;
};

export const useCategoryStore = create<CategoryState & CategoryActions>((set) => ({
    data: [],
    pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        next_page_url: null,
        prev_page_url: null,
    },
    searchTerm: '',
    deleteDialogOpen: false,
    categoryToDelete: null,
    categoryDialogOpen: false,
    categoryToEdit: null,
    isLoading: false,

    setData: (data) => set({ data }),
    setPagination: (pagination) => set({ pagination }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setDeleteDialogOpen: (deleteDialogOpen) => set({ deleteDialogOpen }),
    setCategoryToDelete: (categoryToDelete) => set({ categoryToDelete }),
    setCategoryDialogOpen: (categoryDialogOpen) => set({ categoryDialogOpen }),
    setCategoryToEdit: (categoryToEdit) => set({ categoryToEdit }),
    setIsLoading: (isLoading) => set({ isLoading }),
}));
