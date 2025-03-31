
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Common country codes with their flags
const countryCodes = [
  { code: '+1', country: '🇺🇸 United States' },
  { code: '+44', country: '🇬🇧 United Kingdom' },
  { code: '+1', country: '🇨🇦 Canada' },
  { code: '+61', country: '🇦🇺 Australia' },
  { code: '+33', country: '🇫🇷 France' },
  { code: '+49', country: '🇩🇪 Germany' },
  { code: '+81', country: '🇯🇵 Japan' },
  { code: '+91', country: '🇮🇳 India' },
  { code: '+55', country: '🇧🇷 Brazil' },
  { code: '+52', country: '🇲🇽 Mexico' },
  { code: '+86', country: '🇨🇳 China' },
  { code: '+7', country: '🇷🇺 Russia' },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[115px]">
        <SelectValue placeholder="+1" />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((item) => (
          <SelectItem key={`${item.code}-${item.country}`} value={item.code}>
            {item.country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountryCodeSelect;
