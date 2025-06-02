"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, CheckCircle, XCircle, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Fuse from 'fuse.js';

type Commune = {
  nom: string;
  wilaya_id: number;
  code_postal: string;
  has_stop_desk: number;
};

type CommuneData = Record<string, Commune>;

export default function CommuneStopDeskChecker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommune, setSelectedCommune] = useState<{
    id: string;
    data: Commune;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [communeData, setCommuneData] = useState<CommuneData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load commune data from JSON file
  useEffect(() => {
    const loadCommuneData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/communes.json");
        if (!response.ok) {
          throw new Error("Failed to load commune data");
        }
        const data = await response.json();
        setCommuneData(data);
      } catch (err) {
        setError("Failed to load commune data. Please try again later.");
        console.error("Error loading commune data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCommuneData();
  }, []);

  // Convert the data to a more usable format
  const communes = useMemo(() => {
    return Object.entries(communeData).map(([id, data]) => ({
      id,
      data: data as Commune,
    }));
  }, [communeData]);

  // Initialize Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(communes, {
      keys: [{
        name: 'data.nom',
        getFn: (obj) => {
          return obj.data.nom
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .toLowerCase();
        }
      }],
      threshold: 0.3,
      includeScore: true,
    });
  }, [communes]);

  // Filter communes based on search term using Fuse.js
  const filteredCommunes = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const normalizedSearchTerm = searchTerm
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase();

    const results = fuse.search(normalizedSearchTerm);
    return results
      .map(result => result.item)
      .slice(0, 10); // Limit to 10 results for performance
  }, [searchTerm, fuse]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex = prev < filteredCommunes.length - 1 ? prev + 1 : prev;
          // Scroll the focused item into view after state update
          setTimeout(() => {
            const focusedElement = dropdownRef.current?.children[newIndex] as HTMLElement;
            focusedElement?.scrollIntoView({ block: "nearest" });
          }, 0);
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : prev;
          // Scroll the focused item into view after state update
          setTimeout(() => {
            const focusedElement = dropdownRef.current?.children[newIndex] as HTMLElement;
            focusedElement?.scrollIntoView({ block: "nearest" });
          }, 0);
          return newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredCommunes.length) {
          handleSelectCommune(filteredCommunes[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowResults(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length > 0);
    setSelectedCommune(null);
    setFocusedIndex(-1);
  };

  const handleSelectCommune = (commune: { id: string; data: Commune }) => {
    setSelectedCommune(commune);
    setSearchTerm(commune.data.nom);
    setShowResults(false);
  };

  const clearSelection = () => {
    setSelectedCommune(null);
    setSearchTerm("");
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading commune data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8">
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commune Stop Desk Checker
          </h1>
          <p className="text-gray-600">
            Search for Algerian communes and check if they have a stop desk
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Commune
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="text"
                placeholder="Type commune name..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />

              {showResults && filteredCommunes.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredCommunes.map((commune, index) => (
                    <div
                      key={commune.id}
                      className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        index === focusedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectCommune(commune)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{commune.data.nom}</div>
                          <div className="text-sm text-gray-500">
                            Wilaya {commune.data.wilaya_id} •{" "}
                            {commune.data.code_postal}
                          </div>
                        </div>
                        {commune.data.has_stop_desk ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showResults &&
                filteredCommunes.length === 0 &&
                searchTerm.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
                    No communes found matching &quot;{searchTerm}&quot;
                  </div>
                )}
            </div>

            {searchTerm && (
              <button
                onClick={clearSelection}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            )}
          </CardContent>
        </Card>

        {selectedCommune && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Commune Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedCommune.data.nom}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      Wilaya {selectedCommune.data.wilaya_id}
                    </Badge>
                    <Badge variant="outline">
                      {selectedCommune.data.code_postal}
                    </Badge>
                  </div>
                </div>

                {selectedCommune.data.has_stop_desk ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>✓ Stop Desk Available</strong>
                      <br />
                      This commune has a stop desk service.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>✗ No Stop Desk</strong>
                      <br />
                      This commune does not have a stop desk service.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Data includes {Object.keys(communeData).length} communes from
            Algeria
          </p>
        </div>
      </div>
    </div>
  );
}
