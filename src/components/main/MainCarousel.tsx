"use client";

import { Carousel } from "@material-tailwind/react";
import Banner from "./Banner";

const MainCarousel = () => {
  return (
    <Carousel
      placeholder=""
      className=""
      navigation={({ setActiveIndex, activeIndex, length }) => (
        <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
          {new Array(length).fill("").map((_, i) => (
            <span
              key={i}
              className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
              }`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}
    >
      {/* 업데이트 */}

      <Banner
        imageUrl="https://dvc5zchnvfexa.cloudfront.net/이상/Identity/N사 E.G.O::흉탄/10113_gacksung.webp"
        spanText="저들은 [전율]하리라."
        headingText="N사 E.G.O::흉탄 이상 추가"
        linkPath="/identity/151"
        linkText="인격 정보 바로가기"
      />
      {/* <Banner
        imageUrl="https://dvc5zchnvfexa.cloudfront.net/싱클레어/Identity/동부 엄지 솔다토 II/11013_gacksung.webp"
        spanText="제가 동부의[엄지]라서 다행이라고 생각해요"
        headingText="동부 엄지 솔다토 II 싱클레어 추가"
        linkPath="/identity/149"
        linkText="인격 정보 바로가기"
      /> */}
      {/* 신규 기능 */}
      {/* 발푸밤 리세 홍보 */}
      {/* <Banner
        imageUrl="https://limbus-image-bucket.s3.ap-northeast-2.amazonaws.com/%EB%A3%8C%EC%8A%88/Identity/%EB%A1%9C%EB%B3%B4%ED%86%A0%EB%AF%B8%20E.G.O::%EC%A0%81%EC%95%88%20%C2%B7%20%EC%B0%B8%ED%9A%8C/10410_gacksung.webp"
        spanText="신규 관리자를 위한"
        headingText="리세마라용 티어표 출시 (발푸밤 포함)"
        linkPath="/tier"
        linkText="리세 티어표 바로가기"
      /> */}
    </Carousel>
  );
};

export default MainCarousel;
