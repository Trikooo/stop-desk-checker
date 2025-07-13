"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, Loader2, MapPin, Map } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Wilaya ID to Name mapping (add more as needed)
const wilayaMap: Record<string, string> = {
  "1": "Adrar",
  "2": "Chlef",
  "3": "Laghouat",
  "4": "Oum El Bouaghi",
  "5": "Batna",
  "6": "Bejaia",
  "7": "Biskra",
  "8": "Bechar",
  "9": "Blida",
  "10": "Bouira",
  "11": "Tamanrasset",
  "12": "Tebessa",
  "13": "Tlemcen",
  "14": "Tiaret",
  "15": "Tizi Ouzou",
  "16": "Alger",
  "17": "Djelfa",
  "18": "Jijel",
  "19": "Setif",
  "20": "Saida",
  "21": "Skikda",
  "22": "Sidi Bel Abbes",
  "23": "Annaba",
  "24": "Guelma",
  "25": "Constantine",
  "26": "Medea",
  "27": "Mostaganem",
  "28": "M'sila",
  "29": "Mascara",
  "30": "Ouargla",
  "31": "Oran",
  "32": "El Bayadh",
  "33": "Illizi",
  "34": "Bordj Bou Arreridj",
  "35": "Boumerdes",
  "36": "El Tarf",
  "38": "Tissemsilt",
  "39": "El Oued",
  "40": "Khenchela",
  "41": "Souk Ahras",
  "42": "Tipaza",
  "43": "Mila",
  "44": "Ain Defla",
  "45": "Naama",
  "46": "Ain Temouchent",
  "47": "Ghardaia",
  "48": "Relizane",
  "51": "Ouled Djellal",
  "53": "In Salah",
  "55": "Touggourt",
  "56": "Djanet"
};

type Desk = {
  name: string;
  postalCode: string;
  mapsLink?: string;
};

type DesksData = Record<string, Desk[]>;

export default function WilayaDeskChecker() {
  const [desksData, setDesksData] = useState<DesksData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");

  useEffect(() => {
    const loadDesksData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/desks.json");
        if (!response.ok) {
          throw new Error("Failed to load desks data");
        }
        const data = await response.json();
        setDesksData(data);
      } catch (err) {
        setError("Failed to load desks data. Please try again later.");
        console.error("Error loading desks data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDesksData();
  }, []);

  const wilayaOptions = Object.keys(desksData)
    .filter((id) => wilayaMap[id])
    .map((id) => ({ id, name: wilayaMap[id] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wilaya Stop Desk Checker
          </h1>
          <p className="text-gray-600">
            Select a wilaya to see available stop desks in its communes
          </p>
        </div>

        {loading ? (
          <Card className="w-96 mx-auto">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading desks data...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="w-96 mx-auto">
            <CardContent className="p-8">
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Select Wilaya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedWilaya}
                onValueChange={setSelectedWilaya}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Wilaya" />
                </SelectTrigger>
                <SelectContent>
                  {wilayaOptions.map((wilaya) => (
                    <SelectItem key={wilaya.id} value={wilaya.id}>
                      {wilaya.id}. {wilaya.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {selectedWilaya && desksData[selectedWilaya] && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Stop Desks in {wilayaMap[selectedWilaya]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {desksData[selectedWilaya].map((desk) => (
                  <li key={desk.postalCode} className="flex items-center gap-4 p-4 border rounded-md bg-white">
                    <div className="flex-1">
                      <div className="font-semibold text-lg flex items-center gap-2">
                        {desk.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {desk.mapsLink && (
                        <a
                          href={desk.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-black text-white rounded-full shadow hover:bg-gray-800 transition"
                        >
                          <MapPin className="w-3 h-3 text-white" />
                          Maps
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Data includes {Object.keys(desksData).length} wilayas from Algeria
            {" • "}
            {Object.values(desksData).reduce((acc, desks) => acc + desks.length, 0)} desks in total
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Note: Stop desk locations for the following wilayas are not known:<br />
            <span className="font-medium">54: In Guezzam</span> &amp; <span className="font-medium">58: El Meniaa</span>
          </p>
        </div>
      </div>
    </div>
  );
}
