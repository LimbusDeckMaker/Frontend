"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getSearch } from "@/api/search.api";
import { SearchResponse } from "@/interfaces/search";

interface CardModalProps {
  idx: number;
  onClose: () => void;
}

// grade → 이미지 맵핑
const gradeImg = [
  "/assets/common/1.webp",
  "/assets/common/2.webp",
  "/assets/common/3.webp",
];

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

        {searchData && (
          <div className="mt-2">
            {/* 인격 타이틀 */}
            <div className="inline-block bg-primary-400 text-white font-light text-xl py-1 px-8 rounded-lg w-max">
              인격
            </div>

            {/* Identity 리스트 */}
            <ul className="mt-4 space-y-2">
              {searchData.identityListInfoDto.map((identity) => {
                const imgSrc =
                  gradeImg[
                    Math.min(
                      Math.max(identity.grade - 1, 0),
                      gradeImg.length - 1
                    )
                  ];
                return (
                  <li
                    key={identity.identityName}
                    className="flex items-center justify-between"
                  >
                    {/* grade 이미지 + 이름 박스 */}
                    <div className="flex items-center">
                      <div className="w-[40px] mr-2 flex justify-center">
                        <Image
                          src={imgSrc}
                          alt={`Grade ${identity.grade}`}
                          className="h-[21px] w-auto mr-2"
                          width={21}
                          height={21}
                          quality={10}
                          loading="lazy"
                        />
                      </div>
                      <div className="bg-primary-400 px-3 py-1 rounded-lg">
                        {identity.identityName}
                      </div>
                    </div>
                    {/* 라디오 버튼 */}
                    <input
                      type="radio"
                      name="selectedIdentity"
                      value={identity.identityName}
                      className="form-radio text-primary-100"
                    />
                  </li>
                );
              })}
            </ul>

            {/* EGO 리스트 (이전 상태로 복원) */}
            <div className="mt-6">
              <p className="font-semibold text-lg mb-2">EGO List:</p>
              <ul className="list-disc list-inside">
                {searchData.egoListInfoDto.map((ego) => (
                  <li key={ego.id}>
                    {ego.name} (Grade: {ego.grade})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
