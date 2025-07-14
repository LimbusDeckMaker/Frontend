"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getSearch } from "@/api/search.api";
import { SearchResponse } from "@/interfaces/search";

interface CardModalProps {
  idx: number;
  onClose: () => void;
  onSelectionChange: (data: SelectionData) => void;
  initialSelection?: SelectionData;
}

interface SelectionData {
  selectedIdentity: string | null;
  selectedEgos: { [grade: string]: string };
}

// grade → 이미지 맵핑
const gradeImg = [
  `/assets/common/1.webp`,
  `/assets/common/2.webp`,
  `/assets/common/3.webp`,
];

// ego grade → 이미지 맵핑
const egoGradeImg: { [key: string]: string } = {
  ZAYIN: `/assets/common/ZAYIN.webp`,
  HE: `/assets/common/HE.webp`,
  TETH: `/assets/common/TETH.webp`,
  WAW: `/assets/common/WAW.webp`,
  ALEPH: `/assets/common/ALEPH.webp`,
};

export default function CardModal({
  idx,
  onClose,
  onSelectionChange,
  initialSelection,
}: CardModalProps) {
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(
    initialSelection?.selectedIdentity || null
  );
  const [selectedEgos, setSelectedEgos] = useState<{ [grade: string]: string }>(
    initialSelection?.selectedEgos || {}
  );
  const [activeTab, setActiveTab] = useState<"출전" | "서포트" | "사용X">(
    "출전"
  );

  const handleBackgroundClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleIdentitySelect = (identityName: string) => {
    const newSelection =
      identityName === selectedIdentity ? null : identityName;
    setSelectedIdentity(newSelection);
    onSelectionChange({
      selectedIdentity: newSelection,
      selectedEgos: selectedEgos,
    });
  };

  const handleEgoSelect = (egoName: string, grade: number | string) => {
    const newSelectedEgos = { ...selectedEgos };
    if (newSelectedEgos[grade] === egoName) {
      delete newSelectedEgos[grade];
    } else {
      newSelectedEgos[grade] = egoName;
    }
    setSelectedEgos(newSelectedEgos);
    onSelectionChange({
      selectedIdentity: selectedIdentity,
      selectedEgos: newSelectedEgos,
    });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-500 bg-opacity-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-transparent p-2 rounded-lg w-11/12 max-w-md max-h-screen overflow-y-auto shadow-lg ">
        {searchData ? (
          <div className="bg-primary-450 border-2 border-primary-400">
            <div className="flex justify-end px-2">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className=" text-white">
              {/* 상단 탭 네비게이션 */}
              <div className="flex gap-1 md:gap-2 mb-4 justify-start px-2">
                <button
                  onClick={() => setActiveTab("출전")}
                  className={`w-[60px] h-[20px] text-xs md:w-[76px] md:h-[25px] md:text-sm rounded-lg font-medium bg-yellow-400 text-primary-200 border-2 ${
                    activeTab === "출전"
                      ? "bg-yellow-600"
                      : "border-transparent"
                  }`}
                >
                  출전
                </button>
                <button
                  onClick={() => setActiveTab("서포트")}
                  className={`w-[60px] h-[20px] text-xs md:w-[76px] md:h-[25px] md:text-sm rounded-lg font-medium bg-red-600 text-white border-2 ${
                    activeTab === "서포트" ? "bg-red-900" : "border-transparent"
                  }`}
                >
                  서포트
                </button>
                <button
                  onClick={() => setActiveTab("사용X")}
                  className={`w-[60px] h-[20px] text-xs md:w-[76px] md:h-[25px] md:text-sm rounded-lg font-medium bg-gray-400 text-white border-2 ${
                    activeTab === "사용X" ? "bg-gray-900" : "border-transparent"
                  }`}
                >
                  사용X
                </button>
                {activeTab === "출전" && (
                  <div className="ml-auto w-[120px] md:w-[150px]">
                    <select className="bg-primary-400 text-xs md:text-sm py-1 px-2 rounded">
                      <option value="">편성순서</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 인격 섹션 */}
            <div className="bg-primary-400 text-white ml-1 w-[110px] h-[30px] text-sm text-center rounded flex items-center justify-center">
              인격
            </div>

            <div className=" p-3 rounded-b-lg max-h-[25vh] overflow-y-auto">
              <ul className="space-y-0">
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
                      className="flex items-center justify-between  cursor-pointer"
                      onClick={() =>
                        handleIdentitySelect(identity.identityName)
                      }
                    >
                      <div className="w-[80px] md:w-[100px] h-auto mr-3 flex justify-center">
                        <Image
                          src={imgSrc}
                          alt={`Grade ${identity.grade}`}
                          className="h-[25px] md:h-[35px] w-auto"
                          width={100}
                          height={35}
                          quality={10}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-1 items-center justify-center bg-primary-450 text-primary-100 border border-primary-200">
                        <span className="text-xs md:text-sm">
                          {identity.identityName}
                        </span>
                      </div>
                      <div
                        className={`w-[20px] md:w-[24px] h-[20px] md:h-[24px] rounded-full border-2 ml-2 flex items-center justify-center ${
                          selectedIdentity === identity.identityName
                            ? "border-primary-200 bg-primary-200"
                            : "border-primary-200"
                        }`}
                      >
                        {selectedIdentity === identity.identityName && (
                          <svg
                            className="w-3 h-3 text-black"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* E.G.O 섹션 */}
            <div className="bg-primary-400 text-white ml-3 w-[110px] h-[30px] text-sm text-center rounded flex items-center justify-center">
              E.G.O
            </div>

            <div className=" p-3 rounded-b-lg max-h-[25vh] overflow-y-auto">
              <ul className="space-y-0">
                {searchData.egoListInfoDto.map((ego) => {
                  const egoImgSrc = egoGradeImg[ego.grade] || egoGradeImg[0];
                  return (
                    <li
                      key={ego.id}
                      className="flex items-center justify-between  cursor-pointer"
                      onClick={() => handleEgoSelect(ego.name, ego.grade)}
                    >
                      <div className="w-[80px] md:w-[100px] h-auto mr-3 flex justify-center">
                        <Image
                          src={egoImgSrc}
                          alt={`EGO Grade ${ego.grade}`}
                          className="h-[25px] md:h-[35px] w-auto"
                          width={100}
                          height={35}
                          quality={10}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-1 items-center justify-center bg-primary-450 text-primary-100 border border-primary-200">
                        <span className="text-xs md:text-sm">{ego.name}</span>
                      </div>
                      <div
                        className={`w-[20px] md:w-[24px] h-[20px] md:h-[24px] rounded-full border-2 ml-2 flex items-center justify-center ${
                          selectedEgos[ego.grade] === ego.name
                            ? "border-primary-200 bg-primary-200"
                            : "border-primary-200"
                        }`}
                      >
                        {selectedEgos[ego.grade] === ego.name && (
                          <svg
                            className="w-3 h-3 text-black"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-100"></div>
          </div>
        )}
      </div>
    </div>
  );
}
