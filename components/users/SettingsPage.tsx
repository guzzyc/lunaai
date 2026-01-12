"use client";

import React, { useMemo, useState } from "react";
import AdminHeader from "./AdminHeader";
import UserTable from "./DataTable";
import {
  DefinitionItem,
  TabType,
  TargetItem,
  User,
} from "@/lib/types/user-types";
import { INITIAL_USERS } from "@/lib/constants";
import UserModal from "./UserModal";
import { NewUserData } from "@/lib/actions/user";
import { set } from "zod";
import DataTable from "./DataTable";
import DefinitionModal from "./DefinitionModal";
import TargetModal from "./TargetModal";
import { NewsSourceType } from "@/lib/types/news-types";

interface SettingsPageProps {
  initialUsers: User[];
  initialCategories: DefinitionItem[];
  initialIndustries: DefinitionItem[];
  initialTags: DefinitionItem[];
  initialTaskTypes: DefinitionItem[];
  initialTargets: TargetItem[];
  newsSourcesOptions:NewsSourceType[]
}

export default function SettingsPage({
  initialUsers,
  initialCategories,
  initialIndustries,
  initialTags,
  initialTaskTypes,
  initialTargets,
  newsSourcesOptions
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Users");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [categories, setCategories] =
    useState<DefinitionItem[]>(initialCategories);
  const [industries, setIndustries] =
    useState<DefinitionItem[]>(initialIndustries);
  const [taskTypes, setTaskTypes] = useState<DefinitionItem[]>(initialTaskTypes);
  const [tags, setTags] = useState<DefinitionItem[]>(initialTags);
  const [targets, setTargets] = useState<TargetItem[]>(initialTargets);
  const [selectedData, setSelectedData] = useState<
    User | DefinitionItem | TargetItem | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDefinition, setEditingDefinition] =
    useState<DefinitionItem | null>(null);
  const [editingTarget, setEditingTarget] = useState<TargetItem | null>(null);

  const handleAddDataClicked = () => {
    if (activeTab === "Users") {
      setEditingUser(null);
      setIsUserModalOpen(true);
    } else if (activeTab === "Target") {
      setEditingTarget(null);
      setIsTargetModalOpen(true);
    } else {
      setEditingDefinition(null);
      setIsDefinitionModalOpen(true);
    }
  };

  const handleEditData = (data: User | DefinitionItem | TargetItem) => {
    if (activeTab === "Users") {
      setEditingUser(data as User);
      setIsUserModalOpen(true);
    } else if (activeTab === "Target") {
      setEditingTarget(data as TargetItem);
      setIsTargetModalOpen(true);
    } else {
      setEditingDefinition(data as DefinitionItem);
      setIsDefinitionModalOpen(true);
    }
  };

  const handleOnEditClicked = () => {
    if (!selectedData) return;
    if (activeTab === "Users") {
      setEditingUser(selectedData as User);
      setIsUserModalOpen(true);
    } else if (activeTab === "Target") {
      setEditingTarget(selectedData as TargetItem);
      setIsTargetModalOpen(true);
    } else {
      setEditingDefinition(selectedData as DefinitionItem);
      setIsDefinitionModalOpen(true);
    }
  };

  const handleSubmit = (data: User | DefinitionItem | TargetItem) => {
    if (activeTab === "Users") {
      setUsers((prev) => [...prev, { ...(data as User), id: data.id! }]);
    } else if (activeTab === "Category") {
      setCategories((prev) => [
        ...prev,
        { ...(data as DefinitionItem), id: data.id! },
      ]);
    } else if (activeTab === "Industry") {
      setIndustries((prev) => [
        ...prev,
        { ...(data as DefinitionItem), id: data.id! },
      ]);
    } else if (activeTab === "TaskType") {
      setTaskTypes((prev) => [
        ...prev,
        { ...(data as DefinitionItem), id: data.id! },
      ]);
    } else if (activeTab === "Tag") {
      setTags((prev) => [
        ...prev,
        { ...(data as DefinitionItem), id: data.id! },
      ]);
    } else if (activeTab === "Target") {
      // setTargets((prev) => [
      //   ...prev,
      //   { ...(data as TargetItem), id: data.id! },
      // ]);
      setTargets((prev) => {
        const exists = prev.some((t) => t.id === data.id);

        // EDIT → replace in place
        if (exists) {
          return prev.map((t) => (t.id === data.id ? (data as TargetItem) : t));
        }

        // CREATE → append to end
        return [...prev, data as TargetItem];
      });
    }
    setIsUserModalOpen(false);
    setIsDefinitionModalOpen(false);
    setSelectedData(null);
  };

  const handleSubmitOnEdit = (data: User | DefinitionItem | TargetItem) => {
    switch (activeTab) {
      case "Users":
        setUsers((prev) =>
          prev.map((item) => (item.id === data.id ? (data as User) : item))
        );
        break;
      case "Category":
        setCategories((prev) =>
          prev.map((item) =>
            item.id === data.id ? (data as DefinitionItem) : item
          )
        );
        break;
      case "Industry":
        setIndustries((prev) =>
          prev.map((item) =>
            item.id === data.id ? (data as DefinitionItem) : item
          )
        );
        break;
      case "TaskType":
        setTaskTypes((prev) =>
          prev.map((item) =>
            item.id === data.id ? (data as DefinitionItem) : item
          )
        );
        break;
      case "Tag":
        setTags((prev) =>
          prev.map((item) =>
            item.id === data.id ? (data as DefinitionItem) : item
          )
        );
        break;
      case "Target":
        setTargets((prev) =>
          prev.map((item) =>
            item.id === data.id ? (data as TargetItem) : item
          )
        );
        break;
    }

    setIsUserModalOpen(false);
    setIsDefinitionModalOpen(false);
    setSelectedData(null);
  };

  const handleDeleteData = (id: number) => {
    if (activeTab === "Users") {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else if (activeTab === "Category") {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else if (activeTab === "Industry") {
      setIndustries((prev) => prev.filter((u) => u.id !== id));
    } else if (activeTab === "TaskType") {
      setTaskTypes((prev) => prev.filter((u) => u.id !== id));
    } else if (activeTab === "Tag") {
      setTags((prev) => prev.filter((u) => u.id !== id));
    } else if (activeTab === "Target") {
      setTargets((prev) => prev.filter((u) => u.id !== id));
    }
  };

  let currentList: DefinitionItem[] | User[] | TargetItem[] = [];
  switch (activeTab) {
    case "Users":
      currentList = users;
      break;
    case "Category":
      currentList = categories;
      break;
    case "Industry":
      currentList = industries;
      break;
    case "TaskType":
      currentList = taskTypes;
      break;
    case "Tag":
      currentList = tags;
      break;
    case "Target":
      currentList = targets;
      break;
    default:
      currentList = [];
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedData(null);
  };

  return (
    <main className="flex-1 flex flex-col">
      <AdminHeader
        onAddClicked={handleAddDataClicked}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onEditClicked={handleOnEditClicked}
        selectedData={selectedData}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex-1">
        <DataTable
          activeTab={activeTab}
          data={currentList}
          onEdit={handleEditData}
          onDelete={handleDeleteData}
          onSelect={(data) => setSelectedData(data)}
          selectedData={selectedData}
          newsSourcesOptions={newsSourcesOptions}
        />
      </div>
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleSubmit}
        onEditSubmit={handleSubmitOnEdit}
        editingUser={editingUser}
        onDelete={handleDeleteData}
      />
      <DefinitionModal
        isOpen={isDefinitionModalOpen}
        onClose={() => setIsDefinitionModalOpen(false)}
        onSubmit={handleSubmit}
        onEditSubmit={handleSubmitOnEdit}
        editingDefinition={editingDefinition}
        onDelete={handleDeleteData}
        activeTab={activeTab}
      />
      <TargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onSubmit={handleSubmit}
        onEditSubmit={handleSubmitOnEdit}
        editingTarget={editingTarget}
        onDelete={handleDeleteData}
        activeTab={activeTab}
        users={users}
        newsSourcesOptions={newsSourcesOptions}
      />
    </main>
  );
}
