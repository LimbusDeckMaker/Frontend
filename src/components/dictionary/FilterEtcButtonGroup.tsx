import React, { useEffect } from "react";
import useToggleButtons from "@/hooks/useToggleButtons";
import useStore from "@/zustand/store";
import FilterEtcButton from "./FilterEtcButton";

interface Content {
  name: string;
}

interface FilterEtcButtonGroupProps {
  title: string;
  content: Content[];
  propertyToSaveTo: string;
  PageType: string;
}

const FilterEtcButtonGroup = ({
  title,
  content,
  PageType,
  propertyToSaveTo,
}: FilterEtcButtonGroupProps) => {
  const [buttons, toggleButton] = useToggleButtons(
    content.map((item) => item.name)
  );

  const setOptions = useStore((state) => state.setOptionsState);
  const setEgoOptions = useStore((state) => state.setEgoOptionsState);
  const options = useStore((state) => state.optionsState);
  const egoOptions = useStore((state) => state.egoOptionsState);
  const passiveOptions = useStore((state) => state.passiveOptionsState);
  const setpassiveOptions = useStore((state) => state.setPassiveOptionState);

  const savePropertyToOptions = (selectedButtons: string[]) => {
    if (PageType === "Identity") {
      setOptions({
        ...options,
        [propertyToSaveTo]: selectedButtons,
      });
    } else if (PageType === "Ego") {
      setEgoOptions({
        ...egoOptions,
        [propertyToSaveTo]: selectedButtons,
      });
    } else if (PageType === "Passive") {
      setpassiveOptions({
        ...passiveOptions,
        [propertyToSaveTo]: selectedButtons,
      });
    }
  };

  useEffect(() => {
    savePropertyToOptions(
      buttons.filter((button) => button.isSelected).map((button) => button.name)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttons]);

  return (
    <div>
      <span className="text-xs">{title}</span>
      <div className="grid grid-cols-3 gap-1.5">
        {content.map((item, index) => (
          <FilterEtcButton
            key={index}
            name={item.name}
            isSelected={buttons[index].isSelected}
            onClick={() => toggleButton(item.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterEtcButtonGroup;
