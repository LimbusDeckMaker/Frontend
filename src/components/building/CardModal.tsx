"use client";

import React from "react";
import { getSearch } from "@/api/search.api";
import { useEffect, useState } from "react";
import { SearchResponse } from "@/interfaces/search";

interface CardModalProps {
  idx: number;
  onClose: () => void;
}

export default function CardModal({ idx, onClose }: CardModalProps) {
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const handleBackgroundClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        const data = await getSearch(idx + 1);
        setSearchData(data);
      } catch (err) {
        console.error("Error fetching identity detail:", err);
      }
    };

    fetchSearch();
  }, [idx]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-primary-500 p-4 rounded-lg w-11/12 max-w-sm">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-primary-100 hover:text-primary-200 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="mt-2 text-center">
          {searchData && (
            <>
              <div className="mt-4">
                <div className="bg-primary-400 font-semibold text-3xl p-2 rounded-lg">
                  인격
                </div>
                <ul className="list-disc list-inside">
                  {searchData.identityListInfoDto.map((identity) => (
                    <li key={identity.identityName}>
                      {identity.identityName} (Grade: {identity.grade})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <p className="font-semibold">EGO List:</p>
                <ul className="list-disc list-inside">
                  {searchData.egoListInfoDto.map((ego) => (
                    <li key={ego.id}>
                      {ego.name} (Grade: {ego.grade})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
