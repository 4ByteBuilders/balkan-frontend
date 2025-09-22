import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal } from "lucide-react";
import type { SearchFilters } from "@/api/objects";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  isSearching: boolean;
  clearSearch: () => void;
}

const initialFilters: SearchFilters = {
  name: "",
  types: [],
  mimeTypes: [],
  minSizeBytes: undefined,
  maxSizeBytes: undefined,
  afterDate: undefined,
  tags: [],
  uploaderName: "",
};

export const SearchBar = ({
  onSearch,
  isSearching,
  clearSearch,
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [advancedFilters, setAdvancedFilters] =
    useState<SearchFilters>(initialFilters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onSearch({ ...advancedFilters, name: searchTerm });
    setIsDialogOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    setAdvancedFilters(initialFilters);
    clearSearch();
  };

  const handleFilterChange = (
    filter: keyof SearchFilters,
    value: string | string[] | number | undefined
  ) => {
    setAdvancedFilters((prev) => ({ ...prev, [filter]: value }));
  };

  return (
    <div className="flex gap-2 items-center w-full max-w-md">
      <form onSubmit={handleSearch} className="flex-grow flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Advanced Search">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advanced Search</DialogTitle>
            <DialogDescription>
              Use additional filters to refine your search.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-3"
                placeholder="Contains..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="types" className="text-right">
                Types
              </Label>
              <Input
                id="types"
                placeholder="e.g., file,folder"
                value={advancedFilters.types?.join(",")}
                onChange={(e) =>
                  handleFilterChange(
                    "types",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean) as ("file" | "folder")[]
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minSize" className="text-right">
                Min Size (KB)
              </Label>
              <Input
                id="minSize"
                type="number"
                placeholder="e.g., 10"
                value={
                  advancedFilters.minSizeBytes
                    ? advancedFilters.minSizeBytes / 1024
                    : ""
                }
                onChange={(e) =>
                  handleFilterChange(
                    "minSizeBytes",
                    e.target.value ? parseInt(e.target.value) * 1024 : undefined
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdvancedFilters(initialFilters);
                setSearchTerm("");
              }}
            >
              Reset
            </Button>
            <Button onClick={() => handleSearch()}>Apply Search</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSearching && (
        <Button variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>
  );
};
