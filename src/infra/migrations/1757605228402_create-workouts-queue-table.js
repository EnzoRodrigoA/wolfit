export const up = (pgm) => {
  pgm.createTable("workout_queue", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    name: {
      type: "varchar(100)",
      notNull: true,
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    workout_id: {
      type: "uuid",
      notNull: false,
    },

    sequence_index: {
      type: "integer",
      notNull: true,
    },

    completed_at: {
      type: "timestamptz",
      notNull: false,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

export const down = false;
