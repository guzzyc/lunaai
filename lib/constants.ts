import { Value } from "@radix-ui/react-select";
import { User } from "./types/user-types";

export const TABS = [
  { name: "Users", count: 12, value: "Users" },
  { name: "Categories", value: "Category" },
  { name: "Industries", value: "Industry" },
  { name: "Countries", value: "Country" },
  { name: "Task types", value: "TaskType" },
  { name: "Tags", value: "Tag" },
  { name: "Target", value: "Target" },
];

export const INITIAL_USERS: User[] = [
  {
    id: 125,
    name: "Carter Johnson",
    email: "carter.johnson@example.com",
    role: "user",
  },
  {
    id: 126,
    name: "Diana Smith",
    email: "diana.smith@example.com",
    role: "user",
  },
  {
    id: 127,
    name: "Ethan Davis",
    email: "ethan.davis@example.com",
    role: "user",
  },
  {
    id: 128,
    name: "Fiona Brown",
    email: "fiona.brown@example.com",
    role: "user",
  },
  {
    id: 129,
    name: "George Wilson",
    email: "george.wilson@example.com",
    role: "user",
  },
  {
    id: 130,
    name: "Hannah Lee",
    email: "hannah.lee@example.com",
    role: "user",
  },
  {
    id: 131,
    name: "Ian Martinez",
    email: "ian.martinez@example.com",
    role: "user",
  },
  {
    id: 132,
    name: "Jasmine White",
    email: "jasmine.white@example.com",
    role: "user",
  },
];
