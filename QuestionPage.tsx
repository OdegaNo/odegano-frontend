import { useState } from 'react';

export default function QuestionPage() {
  const [selectedValue, setSelectedValue] = useState('');
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <SelectUiBody
      options={options}
      value={selectedValue}
      onChange={handleChange}
    >
      <span>dd</span>
    </SelectUiBody>
  );
}
