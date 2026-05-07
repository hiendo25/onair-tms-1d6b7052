import * as React from "react";

const DEFAULT_MAX_CHARS = 18;
const DEFAULT_MAX_LINES: number | undefined = undefined;
const ELLIPSIS = "...";
const DEFAULT_FONT_SIZE = 14;
const LINE_HEIGHT_RATIO = 1.2;
const DEFAULT_DOMINANT_BASELINE: React.SVGProps<SVGTextElement>["dominantBaseline"] = "central";

interface MultilineSvgTextProps extends React.SVGProps<SVGTextElement> {
  children: string;
  maxCharsPerLine?: number;
  maxLines?: number;
}

export const MultilineSvgText = ({
  children,
  maxCharsPerLine = DEFAULT_MAX_CHARS,
  maxLines = DEFAULT_MAX_LINES,
  fontSize = DEFAULT_FONT_SIZE,
  dominantBaseline,
  x,
  y,
  ...rest
}: MultilineSvgTextProps) => {
  const textValue = typeof children === "string" ? children : "";
  const words = textValue.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  let currentLine = "";
  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const fontSizeValue = typeof fontSize === "number" ? fontSize : DEFAULT_FONT_SIZE;
  const lineHeight = fontSizeValue * LINE_HEIGHT_RATIO;
  let displayLines = lines;
  if (typeof maxLines === "number" && maxLines > 0 && lines.length > maxLines) {
    displayLines = lines.slice(0, maxLines);
    const lastIndex = displayLines.length - 1;
    displayLines[lastIndex] = `${displayLines?.[lastIndex]?.replace(/\.*$/, "")}${ELLIPSIS}`;
  }
  const lineCount = displayLines.length > 0 ? displayLines.length : 1;
  const startDy = lineCount > 1 ? -((lineCount - 1) * lineHeight) / 2 : 0;

  return (
    <text x={x} y={y} fontSize={fontSize} dominantBaseline={dominantBaseline ?? DEFAULT_DOMINANT_BASELINE} {...rest}>
      {displayLines.length === 0 ? (
        <tspan x={x} dy={0}>
          {textValue}
        </tspan>
      ) : (
        displayLines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? startDy : lineHeight}>
            {line}
          </tspan>
        ))
      )}
    </text>
  );
};
