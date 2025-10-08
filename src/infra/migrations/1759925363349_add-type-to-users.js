export const up = (pgm) => {
  pgm.createType("plan_type", ["free", "premium"]);
  pgm.addColumn("users", {
    plan_type: {
      type: "plan_type",
      notNull: true,
      default: "free",
    },
  });
};

export const down = false;
