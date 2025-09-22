export const up = (pgm) => {
  pgm.createTable("workout_queue", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    workout_id: {
      type: "uuid",
      notNull: true,
    },

    sequence_index: {
      type: "integer",
      notNull: true,
    },

    last_date: {
      type: "timestamptz",
      notNull: false,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

export const down = false;
