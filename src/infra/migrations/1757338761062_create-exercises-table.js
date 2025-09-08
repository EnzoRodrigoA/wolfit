export const up = (pgm) => {
  pgm.createTable("exercises", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    exercise_name: {
      type: "varchar(50)",
      notNull: true,
      unique: true,
    },
    target_muscle: {
      type: "varchar(30)",
      notNull: true,
    },
  });
  pgm.sql(`
    INSERT INTO exercises (exercise_name, target_muscle) VALUES
    -- Peito
    ('Supino Reto Barra', 'Peito'),
    ('Supino Reto Halteres', 'Peito'),
    ('Supino Inclinado Barra', 'Peito'),
    ('Supino Inclinado Halteres', 'Peito'),
    ('Supino Declinado Barra', 'Peito'),
    ('Crucifixo Reto Halteres (Fly)', 'Peito'),
    ('Crucifixo Inclinado Halteres (Incline Fly)', 'Peito'),
    ('Peck Deck (Fly Máquina)', 'Peito'),
    ('Crossover Polia Alta', 'Peito'),
    ('Crossover Polia Baixa', 'Peito'),

    -- Costas
    ('Puxada Frente Barra Aberta', 'Costas'),
    ('Puxada Frente Barra Fechada', 'Costas'),
    ('Puxada Atrás Barra', 'Costas'),
    ('Remada Curvada Barra', 'Costas'),
    ('Remada Curvada Halteres', 'Costas'),
    ('Remada Cavalinho (T-Bar Row)', 'Costas'),
    ('Remada Baixa Polia', 'Costas'),
    ('Barra Fixa', 'Costas'),
    ('Levantamento Terra', 'Costas'),
    ('Pull Over Halteres', 'Costas'),

    -- Ombros
    ('Desenvolvimento Barra', 'Ombros'),
    ('Desenvolvimento Halteres', 'Ombros'),
    ('Desenvolvimento Máquina', 'Ombros'),
    ('Elevação Lateral Halteres', 'Ombros'),
    ('Elevação Lateral Máquina', 'Ombros'),
    ('Elevação Frontal Halteres', 'Ombros'),
    ('Encolhimento de Ombros Barra', 'Ombros'),
    ('Encolhimento de Ombros Halteres', 'Ombros'),
    ('Crucifixo Inverso Halteres', 'Ombros'),
    ('Crucifixo Inverso Máquina', 'Ombros'),

    -- Bíceps
    ('Rosca Direta Barra', 'Bíceps'),
    ('Rosca Direta Halteres', 'Bíceps'),
    ('Rosca Alternada', 'Bíceps'),
    ('Rosca Scott Barra', 'Bíceps'),
    ('Rosca Scott Máquina', 'Bíceps'),
    ('Rosca Concentrada', 'Bíceps'),
    ('Rosca Martelo', 'Bíceps'),

    -- Tríceps
    ('Tríceps Pulley Barra Reta', 'Tríceps'),
    ('Tríceps Pulley Corda', 'Tríceps'),
    ('Tríceps Francês Halteres', 'Tríceps'),
    ('Tríceps Francês Barra', 'Tríceps'),
    ('Supino Fechado', 'Tríceps'),
    ('Mergulho no Banco', 'Tríceps'),
    ('Paralelas', 'Tríceps'),

    -- Pernas (Quadríceps, Posterior, Glúteo, Panturrilha)
    ('Agachamento Livre Barra', 'Pernas'),
    ('Agachamento Smith', 'Pernas'),
    ('Leg Press 45', 'Pernas'),
    ('Cadeira Extensora', 'Pernas'),
    ('Cadeira Flexora', 'Pernas'),
    ('Mesa Flexora', 'Pernas'),
    ('Stiff Barra', 'Pernas'),
    ('Stiff Halteres', 'Pernas'),
    ('Avanço Halteres (Lunge)', 'Pernas'),
    ('Glúteo Máquina', 'Pernas'),
    ('Glúteo Crossover', 'Pernas'),
    ('Panturrilha em Pé Barra', 'Pernas'),
    ('Panturrilha Sentado Máquina', 'Pernas'),
    ('Panturrilha Leg Press', 'Pernas'),

    -- Abdômen
    ('Abdominal Supra Reto', 'Abdômen'),
    ('Abdominal Infra', 'Abdômen'),
    ('Prancha', 'Abdômen'),
    ('Elevação de Pernas Barra Fixa', 'Abdômen'),
    ('Abdominal Máquina Crunch', 'Abdômen');
  `);
};

export const down = false;
