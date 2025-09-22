export const up = (pgm) => {
  pgm.createType("sex_enum", ["male", "female", "other"]);
  pgm.createType("experience_enum", ["beginner", "intermediate", "advanced"]);
  pgm.createType("goal_enum", ["gain_mass", "lose_fat", "maintain"]);

  pgm.createTable("user_settings", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    date_of_birth: {
      type: "date",
    },

    sex: {
      type: "sex_enum",
    },

    weight: {
      type: "integer",
    },

    height: {
      type: "integer",
    },

    experience_level: {
      type: "experience_enum",
    },

    frequency: {
      type: "integer",
    },

    goal: {
      type: "goal_enum",
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

export const down = false;
