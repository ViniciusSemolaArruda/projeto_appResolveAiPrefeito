window.CASES = {
  "1": {
    title: "Buraco na Rua Principal",
    status: "progress",              // progress | received | done
    protocol: "EPF-2025-001",
    image: "./src/assets/img/buraco.png",
    category: "Buraco",
    description: "Buraco grande na rua que está causando acidentes",
    address: "Rua Principal, 123 - Centro",
    timeline: [
      { type: "received",  date: "19/10/2025", desc: "Ocorrência registrada com sucesso" },
      { type: "progress",  date: "24/10/2025", desc: "Equipe de manutenção foi designada" }
    ]
  },
  "2": {
    title: "Poste sem iluminação pública",
    status: "done",
    protocol: "EPF-2025-002",
    image: "./src/assets/img/poste.png",
    category: "Iluminação Pública",
    description: "Poste apagado há mais de uma semana",
    address: "Av. das Flores, 58 - Centro",
    timeline: [
      { type: "received", date: "11/10/2025", desc: "Solicitação recebida" },
      { type: "done",     date: "16/10/2025", desc: "Troca de lâmpada realizada" }
    ]
  },
  "3": {
    title: "Lixo acumulado",
    status: "received",
    protocol: "EPF-2025-003",
    image: "./src/assets/img/lixo.png",
    category: "Coleta de Lixo",
    description: "Lixo não recolhido há 3 dias",
    address: "Rua das Palmeiras, 210 - Centro",
    timeline: [
      { type: "received", date: "22/10/2025", desc: "Ocorrência registrada" }
    ]
  }
};

window.STATUS_CLASS = { 
  progress: "badge-progress", 
  received: "badge-received", 
  done: "badge-done" 
};

window.DOT_EMOJI = { 
  progress: "🔧", 
  received: "📦", 
  done: "✅" 
};

window.STATUS_LABEL = { 
  progress: "Em andamento", 
  received: "Recebida", 
  done: "Concluída" 
};
