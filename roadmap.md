# Migração para este projeto
- [x] Copiar o jogo e recriar o banco de dados completo na nuvem (15 partes; 696 testes passaram).
- [x] Trazer as imagens das poções e do atlas de monstros para este projeto.
- [ ] Verificar criação, salvamento e retomada de personagem com uma conta real: aguardando o dono entrar no jogo pela prévia.
- [ ] Importar jogadores e personagens existentes: aguardando a exportação dos dados do projeto antigo.
- [x] Loja de gemas cria link de pagamento InfinitePay (pagamento real ainda não testado).

# Mochilas
- [x] Grade e contador de cada mochila seguem a backpack equipada nela; o jogador escolhe equipar a backpack na Mochila ou na Mochila de Loot (testado no jogo).

# Mercado — opções marcadas

# Mercado do Depot (entre jogadores)
- [x] Ofertas de compra e venda ao lado do depot (Lawl e Porto Aurora), taxa de 2%, 30 dias, histórico; 12 testes passaram e compra/venda/criar/cancelar testados no jogo com um jogador de teste.
- [ ] Testar entre duas contas reais: aguardando jogadores cadastrados.
 
# Monstros da wiki
- [x] Conferir os 147 monstros página por página na wiki (vida, XP, velocidade, resistências, habilidades, loot e quantidades); corrigidas 3 quantidades de loot.
- [x] Integrar ao catálogo, aparições e combate compartilhado; paralisia agora deixa o jogador mais lento e monstros invisíveis somem para todos.
- [x] Testar atributos, danos (armadura/escudo só no físico), loot e efeitos (14 testes) e caçar no jogo sem erros.
- [x] Scarf, Skull/Hawk/Cowboy Bandana e Crude Ring viraram equipamentos (só armadura e nível da wiki); Prison Key abre o Baú da Prisão (ouro, poções Large ou um desses itens). 11 testes passaram e o baú foi aberto no jogo.
- [x] Adicionar os 11 anéis da wiki (nível, vocação, armadura, skills e velocidade); os de Magic Chest saem dos baús; aparecem em 💍 Anéis no GM (testes passaram).
- Orc Warden e Santa Impersonator não existem no jogo: Old Ring e Santa Ring só pelo GM.
- [ ] Equipar os anéis no jogo: aguardando uma conta cadastrada (ainda não há jogadores).
- [x] Testes do banco de dados voltaram a carregar o banco do jogo completo (77 testes de banco passaram).
- A wiki não publica frequência das magias, alcance/área, duração de efeitos nem chance de drop: o jogo usa valores próprios (ataque a cada 4s, corpo a corpo 2s, alcance 7, efeitos 4s, drop 10%).

- [x] Bênção de 1 gema é uma carga do pacote completo: -56% nas perdas de XP e skills, consumida na morte inclusive com caveiras vermelha/preta; preserva penalidades de itens dessas caveiras.
- [x] Ativar EXP +50% por 1 hora (50 gemas), teleporte (5), bênção para uma morte (1) e troca de nome (50), também para Free Accounts.
- [x] Proteger cobrança e persistência; 22 testes passaram e botões verificados em celular/computador.
- [ ] Verificar compras de ponta a ponta no jogo autenticado: não há usuários cadastrados e a criação de sessão de teste não foi possível.

# Gemas vendáveis
- [x] Só gemas compradas na loja ou dadas pelo GM são vendáveis; trocas só aceitam vendáveis; recebidas chegam não vendáveis; gasto usa primeiro as não vendáveis; troca cancelada devolve como estavam (7 testes passaram).
- [x] Janela de troca limita e mostra as gemas vendáveis; Status mostra o número real.
- [ ] Testar no jogo com dois jogadores logados: aguardando duas contas reais (ainda não há contas).

# Expansão marítima
 
# Magias — retomada dos testes
- [ ] Testar lançamentos e efeitos no jogo e corrigir regressões encontradas.
- [ ] Atualizar os textos antigos na criação de personagem.
- [ ] Verificar cura/grupo/ilusão entre contas: a nova cópia ainda não tem usuários autenticados.

# Expansão marítima (tarefas anteriores)
- [ ] Adicionar chats semelhantes ao Tibia, canais, mensagens privadas, regras e denúncias protegidas.
- [x] Ajustar e verificar velocidade dos jogadores comuns por nível, seguindo a progressão do Tibia.
- [x] Adicionar seleção e criação de até cinco personagens por e-mail, preservando os atuais e validando o limite na nuvem.
- [x] Testar limite, isolamento dos personagens e seleção no jogo.
- [x] Adicionar viagens de barco entre Lawl e uma nova cidade.
- [x] Criar habitats próprios para os novos monstros, com limites de movimentação e reaparecimento.
- [x] Verificar ida, volta e caça no jogo e leitura dos dados salvos localmente.
- [ ] Confirmar recuperação da posição na nuvem após recarregar: outra sessão ativa sobrescreve o mesmo personagem durante o teste.

# GameMaster
- [x] Magias do GameMaster sem tempo de espera (jogadores normais continuam com espera); 2 testes passaram.
- [ ] Ajustar speed por nível/força dos monstros e testar detecção imediata e perseguição local/compartilhada.
- [x] Monstros cercam o personagem pelos 8 lados, esperam por perto quando lotado e repõem a vaga de quem morre (testado).
- [x] Atlas exclusivo com templo, portais dos bosses e seleção de coordenadas após ativar teleporte.
- [x] Verificar atlas e teleporte com GM autenticado: templo, portal de boss, bloqueios e celular; 11 testes passaram.
- [x] Adicionar concessão protegida e auditada de gemas ao próprio GM ou qualquer jogador.
- [x] Testar concessão de gemas, destinatários e bloqueio de jogadores sem autorização.
- [ ] Liberar todas as magias e equipamentos de qualquer classe/nível exclusivamente para GM.
- [ ] Adicionar níveis e skills para o próprio GM ou qualquer jogador, com persistência e auditoria.
- [ ] Testar novas permissões e ajustes de progressão.
- [x] Automatizar a autorização por e-mail confirmado e personagem GameMaster, sem ID fixo, com testes de recriação.
- [x] Autorizar exclusivamente a conta do dono e o personagem GameMaster.
- [ ] Adicionar poderes clássicos e administrativos com ações protegidas.
- [ ] Testar exclusividade e o uso dos poderes no jogo.
# Cidade
- [x] Afastar as duas áreas de caça ao sul mostradas na foto em 8 SQM, preservar casas e verificar acessos; 44 testes passaram e jogo abriu sem erros.
- [x] Bairros com ruas e casas em volta do centro, treino e depósito.
- [x] Zoom de aproximar/afastar no minimapa.
- [x] Quadruplicar a área das 22 casas, ampliar bairros e alinhar portas e catálogo de aluguel; nove testes passaram e jogo logado verificado em computador/celular.

# Remix — passos de ativação
- [x] Limpar as migrações Drizzle copiadas e recriar um conjunto vazio para o banco do novo projeto.
- [ ] Preservar personagens e progresso compartilhado das contas Google deste jogo nos futuros remixes: depende de uma conexão central de contas e saves, independente das conexões recriadas no remix.

# Migração do arquivo .zip
- [x] Copiar jogo, páginas, imagens e testes.
- [x] Recriar o banco completo (personagens, chat, GM, casas, trocas, ranking, pedidos de gemas, caveiras PvP) e testar: 159 testes passaram.
- [x] Login por e-mail/senha e Google.
- [x] Tag InfinitePay salva com segurança.
- [ ] Importar dados antigos (personagens, saves, ranking, pedidos) e usuários: aguardando exportação do usuário.
- [ ] Jogar logado de ponta a ponta na prévia: aguardando o usuário entrar com uma conta (não há contas ainda).

# InfinitePay
- [x] Evitar o bloqueio de navegação na prévia do editor e verificar pagamento na mesma aba fora dela.
- [x] Abrir pagamento na mesma aba e retomar diretamente o personagem na volta, sem novas guias.
- [x] Configurar a tag informada e verificar criação de pagamento e confirmação protegida.
- [ ] Confirmar entrega após um pagamento real: depende de pagamento pelo comprador.

# Aluguel de casas
- [ ] Portas individuais, oferta ao se aproximar e chave exclusiva por personagem.
- [ ] Aluguel semanal/mensal em gemas calculado pelo SQM interno, com cobrança e validade protegidas.
- [ ] Testar preço, acesso, vencimento e aluguel no jogo.

# Visual 16-bit (referência Pinterest)
- [x] Novos sprites pixel art para todos os monstros (terra e ilhas) e chefes Faraó/Azaroth.
- [x] Novo chão, grama, água com espuma, caminhos, muros, telhados, assoalho e árvores.
- [x] Chão texturizado da praia, selva e ruínas.
- [ ] Ícones pixel art dos itens (hoje emojis): aguardando o usuário confirmar.

# Migração para este projeto (novo .zip)
- [x] Copiar jogo, páginas, imagens, pagamento InfinitePay e testes.
- [x] Recriar todo o banco do jogo (o .zip não trazia o banco) e testar: 193 testes passaram.
- [x] Login por e-mail/senha e Google; link de primeiro acesso / nova senha.
- [x] Tag InfinitePay salva com segurança.
- [ ] Importar dados antigos (personagens, saves, ranking, pedidos) e usuários: aguardando exportação.
- [ ] Jogar logado de ponta a ponta na prévia: aguardando a primeira conta entrar.

# Itens (18 categorias da print)
- [ ] Criar as poções de vida da wiki, com compra, uso, cura e testes no jogo.
- [x] Catálogo "Itens" com as 18 abas, novos colares/mochilas e consumíveis compráveis e usáveis (testado no navegador).

# Escudos do wiki (aba Shield)
- [x] Colocar os 35 itens (21 escudos Knight/Paladin, 14 spellbooks Sorcerer/Druid) na aba Escudos.
- [x] Bônus de Defesa/Magia e resistências por elemento funcionando no combate.
- [x] Bloquear escudo de outra vocação.
- [x] Ferreiro vende Chain, Soldier, Viking e Gladiator; os demais caem de monstros e chefes com chance baixa.
- [x] Testar regras e no jogo.

# Exclusão dos equipamentos por nível (Nv 1 Aprendiz a Nv 100 Lenda)
- [x] Tirar da loja do Ferreiro (só escudos), da lista do GameMaster e da enciclopédia.
- [x] Apagar dos personagens ao entrar no jogo e depois de receber uma troca (vestidos, mochila, depot).
- [x] Manter os presentes antigos do GameMaster entregando o escudo certo.
- [x] Testar no jogo (loja, enciclopédia, personagem com itens antigos).

# Migração para este projeto (terceiro .zip)
- [x] Copiar jogo, páginas, imagens, poções, pagamento InfinitePay e testes.
- [x] Recriar todo o banco do jogo (o .zip não trazia o banco) e testar: 239 testes passaram.
- [x] Login por e-mail/senha e Google; link de primeiro acesso / nova senha.
- [x] Jogar logado com dois jogadores na prévia (criar herói, entrar no mapa, chat, ranking, casas).
- [x] Tag InfinitePay salva com segurança.
- [ ] Confirmar entrega de gemas após um pagamento real.
- [ ] Importar dados antigos (personagens, saves, ranking, pedidos) e usuários: aguardando exportação.

# Migração para este projeto (quarto .zip)
- [x] Copiar jogo, páginas, imagens, pagamento InfinitePay e testes.
- [x] Recriar todo o banco do jogo (o .zip não trazia o banco) e testar: 288 testes passaram.
- [x] Login por e-mail/senha e Google; link de primeiro acesso / nova senha.
- [x] Poções: imagens copiadas para este projeto.
- [x] Jogar logado com dois jogadores na prévia (criar herói, entrar no mapa, chat, ranking, casas).
- [x] Tag InfinitePay salva com segurança.
- [ ] Confirmar entrega de gemas após um pagamento real.
- [ ] Importar dados antigos (personagens, saves, ranking, pedidos) e usuários: aguardando exportação.

# Assistente de Caça e loot no chão
- [x] Auto-Cura + Auto-Loot unidos no Assistente de Caça; só com Premium ativo + Assistente comprado (100 gemas, 30 dias, zera se o Premium acabar).
- [x] Sem o assistente, drops caem no chão (XP e gemas entram direto); 30s só do dono, depois qualquer um, some em 3 min; testado no jogo e no servidor.
- [ ] Testar disputa do loot com dois jogadores reais logados ao mesmo tempo.

# Munições da wiki (Ammunition)
- [x] 8 munições com atributos da wiki e efeitos funcionais (elemento, área, queda de monstros); testado no jogo.
- [x] Munições disponíveis na aba GM, com elemento, área e tipo de arma.

# Elementos (wiki Elements)
- [x] Resistências dos monstros pela wiki (incluindo mar e chefes) valendo para armas, varinhas, flechas, magias e runas.
- [x] Arcos e bestas encantados causam o dano do elemento.
- [x] Aba Elementos na tela de Itens (monstros, itens resistentes, armas, runas e munições).
- [ ] Botas da wiki (9 aparecem nas listas de elementos e ainda não existem no jogo): aguardando o usuário pedir.

# Guildas
- [x] Botão Guilda do Status abre a janela de guilda (antes não fazia nada).
- [x] Criar guilda por 500 gemas com confirmação, convites (aceitar/recusar), cargos líder/vice/membro, títulos, mensagem, histórico, sair/dissolver e limite de 200 membros; regras protegidas no servidor (12 testes passaram).
- [x] Aba Guilda no chat, visível só para os membros da mesma guilda.
- [x] Janela testada no computador e no celular com dados simulados.
- [ ] Testar guilda de ponta a ponta com duas contas reais: ainda não há contas cadastradas.

# Mundo novo (mobs, hunts e cidades)
- [x] Monstros antigos fora do mapa (mantidos no catálogo); 169 monstros da wiki em 41 áreas de caça, dos mais fracos (perto de Lawl) aos mais fortes.
- [x] Hunts afastadas de Lawl, pontos de lure para 8+ monstros, corredores de 2/3/4 SQM, andar de cima e caverna.
- [x] Cidades novas Kharum, Glacira e Umbra com templo, sacerdote, depot, lojas, porto e 8 casas cada (24 casas novas cadastradas para aluguel).
- [x] Terras de nível alto só Premium, por barco e por terra; morte e pergaminho sempre levam ao templo de Lawl.
- [x] GM pode teleportar para qualquer ponto do mapa maior; 273 verificações passaram.
- [ ] Testar com conta real aluguel das casas novas, barcos e sacerdotes: ainda não há contas cadastradas.

# Velocidade dos monstros
- [x] Todos os monstros andam 55% mais devagar (45% da velocidade anterior), no jogo solo e online.
- [x] Com os 8 SQM em volta do personagem ocupados, os outros monstros que o veem param e andam aleatoriamente até abrir um espaço; então voltam a atacar.
- [x] Monstros ignoram o GameMaster (sozinho e online): não seguem nem atacam, só passeiam normalmente.

# Seguir em combate
- [x] Três modos (Parado, Seguir, Distância) para monstros e jogadores em PvP, salvos no personagem; 10 testes passaram e perseguição/distância verificadas no jogo.
- [ ] Testar perseguição de jogador em PvP com duas contas reais: aguardando contas.

# Assistente (curas e poções)
- [x] Prioridade 1/2/3 das magias de cura com setas ▲▼; poções de vida e mana escolhidas entre as do jogo (com bloqueio por vocação e nível); tela conferida no celular.

# Revidar no PvP
- [x] Quem foi atacado pode revidar em qualquer modo de ataque, sem ganhar caveira; botão ⚔️ Revidar aparece enquanto alguém ataca você (testado com um atacante simulado).
- [ ] Testar revide com duas contas reais: aguardando contas.

# Combate — danos e morte
- [x] Números de dano mostram a vida realmente perdida (monstros e jogadores); em PvP o atacante vê o dano já reduzido pela defesa da vítima.
- [x] Morrer em PvP agora acontece ao zerar a vida: volta ao templo e consome a carga de bênção (testado morrendo para monstros no jogo).
- [ ] Testar morte e números de dano em PvP com dois jogadores: aguardando duas contas reais.

# Árvores e paredes bloqueiam ataques
- [x] Regra de bloqueio (árvores, paredes, muros de casa, rochas; água não) e Distância procura visão livre.
- [x] Usar a regra em ataques comuns, magias de alvo e área, runas, invocações, habilidades de monstros e PvP (envio e recebimento).
- [x] Monstros de longe se aproximam quando não têm visão.
- [x] Testes (12 novos) e teste no jogo: Paladin não acerta atrás da árvore e acerta com visão livre.
- [ ] Knight: Whirlwind Throw e Executioner's Throw ainda alcançam 5 SQM — aguardando decisão do dono.
- [ ] Testes de banco de casas (porta/aluguel) falhando desde o remix; não relacionados a esta mudança.

# Destino do loot no Assistente
- [x] Escolher por item: Mochila de Loot, Mochila ou deixar no chão (busca, filtro e seleção em grupo).
- [x] Mochila e Mochila de Loot com os espaços da backpack usada; cheias só juntam itens agrupáveis já guardados (10 testes).
- [ ] Testar caçando com uma conta real com Premium + Assistente: aguardando uma conta cadastrada.

# Subsolos maiores
- [x] Cada caverna do subsolo ficou ~7× maior (6,4× a 8× mais chão andável que antes), com 3× os monstros e 6+ pontos de lure; escadas, portais de boss, Premium, GM e saves antigos ajustados (824 testes passaram, caverna visitada no jogo).

# Ícones dos itens
- [x] Figuras de todos os 818 itens do jogo (792 da wiki + itens só do jogo desenhados no mesmo estilo) na mochila, loja, NPCs, depot, trocas, catálogo e nas bolsas no chão (testado no jogo com personagem local).
- [x] GM panel: give items, gold, gems, Premium and levels/skills to any character, even offline or not the active one
- [x] Starting-area monsters (wiki speed 0) walk smoothly instead of jumping

# Imbuimentos (Charles e Russel)
- [x] 13 imbuimentos (Velocidade, Vida, Mana, Crítico, 4 habilidades, 5 proteções) em 3 níveis com itens de criaturas e ouro; até 8 guardados e 4 ligados; tempo só corre em combate; Russel cancela. 16 testes passaram e as janelas foram testadas no navegador.
- [ ] Testar numa caçada real com conta logada: aguardando o dono entrar no jogo.
