// src/pages/TecoTecoPage/utils/helpers.ts

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const bg = getRandomColor();
  const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
            <circle cx="32" cy="32" r="32" fill="${bg}"/>
            <text x="32" y="42" font-size="32" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif">?</text>
        </svg>
    `;
  e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  e.currentTarget.alt = '프로필 이미지 없음';
};
