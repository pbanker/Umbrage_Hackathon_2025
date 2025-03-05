import Select from "react-select";

export const ChatSettings: React.FC = () => {
  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];

  return (
    <div className="flex flex-col w-1/4 p-4 gap-4 rounded-lg bg-white">
      <div className="flex flex-col items-start gap-2.5">
        <span>Client Name</span>
        <input
          type="text"
          placeholder="Client Name"
          className="p-2 border rounded-lg self-stretch"
        />
      </div>
      <div className="flex flex-col items-start gap-2.5">
        <span>Project Name</span>
        <input
          type="text"
          placeholder="Project Name"
          className="p-2 border rounded-lg self-stretch"
        />
      </div>
      <div className="flex flex-col items-start gap-2.5">
        <span>Budget</span>
        <input
          type="text"
          placeholder="$10,000.00"
          className="p-2 border rounded-lg self-stretch"
        />
      </div>

      <div className="flex flex-col items-start gap-2.5">
        <span>Deadline</span>
        <input
          type="text"
          placeholder="01/01/2022"
          className="p-2 border rounded-lg self-stretch"
        />
      </div>

      <div className="flex flex-col items-start gap-2.5">
        <span>Services</span>
        <Select
          className="self-stretch"
          options={options}
          styles={{
            control: (styles) => ({
              ...styles,
              backgroundColor: "white",
              border: "1px solid #000",
              borderRadius: "8px",
            }),
          }}
          isMulti
        />
      </div>
    </div>
  );
};
