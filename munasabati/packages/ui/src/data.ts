import { useSyncExternalStore } from "react";
import { createLocalRepository, type DB, type Mutation, type Repository } from "@munasabati/core";

/** نسخة واحدة من المستودع لكل تطبيق. للتبديل لخادم حقيقي: استبدل createLocalRepository فقط. */
export const repo: Repository = createLocalRepository();

export function useDB(): DB {
  return useSyncExternalStore(repo.subscribe, repo.get, repo.get);
}

export const apply = (m: Mutation) => repo.apply(m);
