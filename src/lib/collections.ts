import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { selectConfigSchema, selectTodoSchema } from "../db/validation";
import { api } from "./api";

// Electric Todo Collection
export const electricTodoCollection = createCollection(
  electricCollectionOptions({
    id: `todos`,
    shapeOptions: {
      url: `http://localhost:3003/v1/shape`,
      params: {
        table: `todos`,
      },
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    getKey: (item) => item.id,
    schema: selectTodoSchema,
    onInsert: async ({ transaction }) => {
      const {
        id: _id,
        created_at: _f,
        updated_at: _ff,
        ...modified
      } = transaction.mutations[0].modified;
      const response = await api.todos.create(modified);
      return { txid: response.txid };
    },
    onUpdate: async ({ transaction }) => {
      const txids = await Promise.all(
        transaction.mutations.map(async (mutation) => {
          const { original, changes } = mutation;
          const response = await api.todos.update(original.id, changes);
          return response.txid;
        })
      );
      return { txid: txids };
    },
    onDelete: async ({ transaction }) => {
      const txids = await Promise.all(
        transaction.mutations.map(async (mutation) => {
          const { original } = mutation;
          const response = await api.todos.delete(original.id);
          return response.txid;
        })
      );
      return { txid: txids };
    },
  })
);

// Electric Config Collection
export const electricConfigCollection = createCollection(
  electricCollectionOptions({
    id: `config`,
    shapeOptions: {
      url: `http://localhost:3003/v1/shape`,
      params: {
        table: `config`,
      },
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    getKey: (item) => item.id,
    schema: selectConfigSchema,
    onInsert: async ({ transaction }) => {
      const modified = transaction.mutations[0].modified;
      const response = await api.config.create(modified);
      return { txid: response.txid };
    },
    onUpdate: async ({ transaction }) => {
      const txids = await Promise.all(
        transaction.mutations.map(async (mutation) => {
          const { original, changes } = mutation;
          const response = await api.config.update(original.id, changes);
          return response.txid;
        })
      );
      return { txid: txids };
    },
  })
);
