import {
  createCollection,
  eq,
  localOnlyCollectionOptions,
  localStorageCollectionOptions,
  useLiveQuery,
} from "@tanstack/react-db";
import { Schema } from "effect";

const UserPreferenceShape = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("COLOR_MODE"),
    value: Schema.Literal("DARK", "LIGHT", "SYSTEM"),
  }),
  Schema.Struct({
    type: Schema.Literal("LANGUAGE"),
    value: Schema.Literal("pl-PL", "en-US"),
  })
);

// Type of key is inferred here as number | string instead of "COLOR_MODE" | "LANGUAGE"
export const userPreferencesCollection = createCollection(
  localStorageCollectionOptions({
    id: "userPreferences",
    schema: Schema.standardSchemaV1(UserPreferenceShape),
    storage: globalThis.localStorage ?? {},
    storageEventApi: globalThis,
    storageKey: "user-preferences",
    getKey: (userPreference) => userPreference.type,
  })
);

// Can't discriminate union with functional where
export const useLanguageFunctionalWhere = () => {
  const { data: preferences } = useLiveQuery((q) =>
    q
      .from({ userPreferencesCollection })
      .fn.where(
        ({ userPreferencesCollection }) =>
          userPreferencesCollection.type === "LANGUAGE"
      )
  );

  const preference = preferences.at(0);

  preference?.type;
  //            ^?
  preference?.value;
  //             ^?;
};

// Can't discriminate union with standard where

export const useLanguageStandardWhere = () => {
  const { data: preferences } = useLiveQuery((q) =>
    q
      .from({ userPreferencesCollection })
      .where(({ userPreferencesCollection }) =>
        eq(userPreferencesCollection.type, "LANGUAGE")
      )
  );

  const preference = preferences.at(0);

  preference?.type;
  //            ^?
  preference?.value;
  //             ^?;
};

// key is number | string here and doesn't narrow down
userPreferencesCollection.update();

// key is number | string here and doesn't narrow down
userPreferencesCollection.get();

// local only collection for example correctly infers key type but still doesn't discriminate in any of examples above
export const test = createCollection(
  localOnlyCollectionOptions({
    id: "userPreferences",
    schema: Schema.standardSchemaV1(UserPreferenceShape),
    getKey: (userPreference) => userPreference.type,
  })
);

// type still not correct
test.get("COLOR_MODE")?.type;
//                          ^?

// @ts-expect-error -- nicely inferred here
test.get("TEST")?.type;
