import { FilterGroup } from "../types/news-types";

export const FILTERS: FilterGroup[] = [
  {
    name: "Category",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
  },
  {
    name: "Industry",
    options: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
  },
];

export const TRAINING_COLORS = [
  "border-danger",     
  "border-success",   
];

export const TRAINING_COLORS_LIGHT = [
  "border-danger/40",
  "border-success/40",
];

export const feedbackColorMap = {
  dislike: {
    normal: TRAINING_COLORS[0],        // red
    light: TRAINING_COLORS_LIGHT[0],
  },
  like: {
    normal: TRAINING_COLORS[1],        // green
    light: TRAINING_COLORS_LIGHT[1],
  },
  notsure: {
    normal: null,                      // neutral
    light: null,
  },
};

export const COMPANY_TAGS_MAP: { [key: string]: string } = {
  "1": "Big company",
  "2": "Urgent",
  "3": "Hot",
};
