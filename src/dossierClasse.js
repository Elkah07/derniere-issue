export const dossierClasse = {
  "schemaVersion": 1,
  "id": "dossier-classe",
  "adventureNumber": 2,
  "title": "Dossier Classé",
  "tagline": "Chaque preuve a une version. Chaque version protège quelqu’un.",
  "status": "content-complete-not-yet-integrated",
  "players": {
    "min": 2,
    "max": 8
  },
  "durationMinutes": {
    "short": 35,
    "normal": 50,
    "long": 70
  },
  "startingLives": 3,
  "inventorySlots": 2,
  "setting": "Centre Valmont, annexe d’archives fermée depuis six ans",
  "premise": "Le groupe reçoit une convocation anonyme avant l’effacement du dossier 42. Le bâtiment se verrouille et distribue des preuves contradictoires. Les joueurs doivent décider quelle vérité faire sortir, qui protéger et qui sacrifier.",
  "gauges": [
    {
      "id": "evidence",
      "label": "Preuves",
      "initial": 0,
      "max": 5,
      "public": true
    },
    {
      "id": "access",
      "label": "Accès",
      "initial": 1,
      "max": 5,
      "public": true
    },
    {
      "id": "time",
      "label": "Temps",
      "initial": 5,
      "max": 5,
      "public": true,
      "decreases": true
    },
    {
      "id": "alert",
      "label": "Alerte",
      "initial": 1,
      "max": 5,
      "public": true
    },
    {
      "id": "trust",
      "label": "Confiance",
      "initial": 0,
      "min": -5,
      "max": 5,
      "public": false
    }
  ],
  "secretPlots": [
    {
      "id": "judicial_error",
      "title": "L’erreur couverte",
      "minPlayers": 2,
      "traitor": false,
      "truth": "Le dossier 42 prouve qu’une erreur administrative a détruit la vie d’un témoin. Aucun joueur ne travaille contre le groupe. Les incohérences viennent d’années de falsifications institutionnelles.",
      "specialBriefing": null
    },
    {
      "id": "protected_witness",
      "title": "Le témoin protégé",
      "minPlayers": 2,
      "traitor": false,
      "truth": "Une personne du groupe connaît l’identité réelle du témoin disparu. Son objectif n’est pas d’empêcher la vérité, mais d’éviter qu’une publication totale mette cette personne en danger.",
      "specialBriefing": "Tu connais l’identité réelle du témoin. Tu peux aider le groupe, mais sa véritable identité ne doit pas être publiée sans protection."
    },
    {
      "id": "seller",
      "title": "Le vendeur",
      "minPlayers": 2,
      "traitor": false,
      "truth": "Une personne sait qu’une copie unique du dossier vaut une fortune. Elle peut coopérer, puis partir seule avec les preuves au dernier moment.",
      "specialBriefing": "La copie complète du dossier peut être vendue. Tu remportes un objectif personnel si tu quittes le Centre avec l’unique copie encore exploitable."
    },
    {
      "id": "mole",
      "title": "La taupe",
      "minPlayers": 4,
      "traitor": true,
      "truth": "Une personne a été envoyée pour provoquer l’effacement du dossier et faire porter la faute à un membre du groupe. Elle dispose de deux sabotages directs.",
      "specialBriefing": "Fais disparaître les preuves ou publie une version fausse. Tu peux saboter deux fois et fabriquer une preuve contre une personne précise."
    }
  ],
  "talents": [
    {
      "id": "analyst",
      "title": "Analyste",
      "icon": "🧠",
      "description": "Avant une décision de route, découvre quelle option protège le mieux les preuves.",
      "context": [
        "route",
        "investigation"
      ]
    },
    {
      "id": "archivist",
      "title": "Archiviste",
      "icon": "🗄️",
      "description": "Ouvre une pièce ou un document normalement inaccessible.",
      "context": [
        "locked",
        "document"
      ]
    },
    {
      "id": "technician",
      "title": "Technicien",
      "icon": "🔧",
      "description": "Répare ou contourne un système sans consommer une ressource.",
      "context": [
        "system",
        "security"
      ]
    },
    {
      "id": "observer",
      "title": "Observateur",
      "icon": "👁️",
      "description": "Vérifie si une déclaration précise correspond à une preuve authentique.",
      "context": [
        "testimony",
        "judgment"
      ]
    },
    {
      "id": "mediator",
      "title": "Médiateur",
      "icon": "🤝",
      "description": "Prolonge une discussion ou empêche une rupture du groupe.",
      "context": [
        "discussion",
        "vote"
      ]
    },
    {
      "id": "protector",
      "title": "Protecteur",
      "icon": "🛡️",
      "description": "Empêche une personne d’être enfermée ou de perdre une vie.",
      "context": [
        "danger",
        "targeted"
      ]
    },
    {
      "id": "doctor",
      "title": "Secouriste",
      "icon": "🩺",
      "description": "Rend une vie ou retire un état de panique à une personne.",
      "context": [
        "injury",
        "stress"
      ]
    },
    {
      "id": "lucky",
      "title": "Instinct",
      "icon": "🍀",
      "description": "Annule une conséquence personnelle négative qui vient de se déclencher.",
      "context": [
        "personal_consequence"
      ]
    }
  ],
  "afterlifePaths": [
    {
      "id": "anonymous_source",
      "title": "Source anonyme",
      "description": "Envoie une information courte au groupe une fois par chapitre, sans révéler son identité.",
      "actions": [
        "Envoyer un indice vrai",
        "Envoyer un indice déformé",
        "Garder le silence"
      ]
    },
    {
      "id": "locked_archive",
      "title": "Enfermé dans les réserves",
      "description": "Fouille une zone inaccessible et peut faire parvenir un document sous une porte.",
      "actions": [
        "Chercher une preuve",
        "Cacher une preuve",
        "Préparer une sortie"
      ]
    },
    {
      "id": "erased_identity",
      "title": "Identité radiée",
      "description": "Le système ne te reconnaît plus. Tu peux agir anonymement sur les listes d’accès.",
      "actions": [
        "Déverrouiller une porte",
        "Bloquer une personne",
        "Modifier un registre"
      ]
    },
    {
      "id": "ghost_operator",
      "title": "Opérateur fantôme",
      "description": "Accède à un vieux terminal et influence les caméras ou l’ascenseur.",
      "actions": [
        "Couper une caméra",
        "Ouvrir un passage",
        "Détourner le groupe"
      ]
    },
    {
      "id": "remote_interrogation",
      "title": "Interrogé à distance",
      "description": "Reçoit des questions privées et peut répondre par la vérité, un mensonge ou un silence.",
      "actions": [
        "Dire la vérité",
        "Mentir",
        "Ne pas répondre"
      ]
    }
  ],
  "chapters": [
    {
      "number": 1,
      "title": "La convocation",
      "icon": "✉️",
      "intro": [
        "À 22 h 43, chacun reçoit le même message sur un canal différent : « Le dossier 42 sera effacé à minuit. Venez seuls. Ne faites confiance à aucune version, pas même à la vôtre. »",
        "L’adresse mène au Centre Valmont, une annexe d’archives administratives officiellement fermée depuis six ans. Lorsque le dernier joueur franchit le hall, les portes se verrouillent. Un écran s’allume derrière l’accueil et affiche les prénoms du groupe, comme si quelqu’un les attendait depuis longtemps."
      ]
    },
    {
      "number": 2,
      "title": "Les trois archives",
      "icon": "🗄️",
      "intro": [
        "Le plan du bâtiment révèle trois ailes : judiciaire, médicale et financière. Chacune contient une partie différente du dossier 42, mais le système de sécurité ne laissera le groupe en ouvrir qu’une avant la prochaine purge.",
        "Choisir une aile, c’est choisir la première vérité que le groupe entendra. Les deux autres resteront silencieuses, ou seront racontées par ceux qui prétendent déjà les connaître."
      ]
    },
    {
      "number": 3,
      "title": "Les versions incompatibles",
      "icon": "🧩",
      "intro": [
        "Les premiers documents ne s’emboîtent pas. Une signature apparaît à deux dates différentes. Un témoin déclaré mort a continué à recevoir des virements. Une photographie comporte une personne que personne ne se souvient avoir vue.",
        "Le Centre Valmont commence alors à distribuer des fragments privés sur les écrans. Chacun reçoit une pièce différente. Certaines sont authentiques. D’autres semblent avoir été préparées pour provoquer une accusation."
      ]
    },
    {
      "number": 4,
      "title": "La salle absente",
      "icon": "🚪",
      "intro": [
        "Derrière un mur de rayonnages, le groupe découvre une porte qui n’existe sur aucun plan. Une caméra pivote lentement vers eux. Le voyant rouge s’allume, puis s’éteint comme un clignement d’œil.",
        "Pour atteindre la salle, il faudra traverser les couloirs techniques. Rester ensemble protégera les plus fragiles. Se séparer permettra de couvrir davantage de terrain. Envoyer une seule personne donnera à cette personne un contrôle absolu sur ce qu’elle racontera ensuite."
      ]
    },
    {
      "number": 5,
      "title": "Le tribunal improvisé",
      "icon": "⚖️",
      "intro": [
        "À 23 h 31, toutes les portes se ferment. Une voix synthétique annonce : « Une identité du groupe est liée au dossier 42. Désignez-la pour poursuivre. »",
        "Au centre d’une ancienne salle d’audition, un siège s’éclaire. Le système réclame un nom. Le groupe peut accuser, refuser de jouer ou tenter de retourner la procédure contre le bâtiment. Le silence, lui, sera interprété comme un consentement."
      ]
    },
    {
      "number": 6,
      "title": "Le protocole d’effacement",
      "icon": "🖥️",
      "intro": [
        "Le serveur central se trouve derrière la salle absente. Un compte à rebours indique vingt-neuf minutes avant l’effacement total du dossier 42. Trois systèmes peuvent encore être activés, mais l’énergie n’en alimentera qu’un.",
        "Publier les preuves risque d’alerter l’organisation qui les a cachées. Déverrouiller le bâtiment peut permettre de fuir sans connaître la vérité. Restaurer les caméras peut enfin révéler qui a menti, mais aussi exposer les secrets personnels de tout le monde."
      ]
    },
    {
      "number": 7,
      "title": "La dernière version",
      "icon": "📡",
      "intro": [
        "Minuit approche. Les portes extérieures, la liaison satellite et l’ascenseur de service ne resteront disponibles que quelques instants. Une seule version du dossier peut sortir intacte.",
        "Le groupe doit décider ce qu’il publie, ce qu’il enterre et qui portera la copie. Les décisions privées commenceront après la discussion. Les promesses prononcées maintenant pourront encore être brisées dans le dernier couloir."
      ]
    }
  ],
  "events": [
    {
      "id": "summons_lobby",
      "chapter": 1,
      "number": 1,
      "title": "Le hall connaît vos noms",
      "scene": [
        "À peine la porte verrouillée, les écrans de l’accueil affichent une liste de prénoms. Une ligne supplémentaire apparaît : « L’un de vous a déjà signé ce registre. »",
        "Sous le comptoir, trois leviers permettent soit d’appeler la sécurité, soit de couper les caméras, soit d’ouvrir les casiers personnels laissés à l’entrée. Le groupe dispose d’une minute avant que le système choisisse seul."
      ],
      "prompt": "Quelle première règle allez-vous imposer au groupe ?",
      "mode": "group",
      "choices": [
        {
          "id": "call_security",
          "label": "Appeler la sécurité",
          "description": "Vous demandez de l’aide et révélez votre présence.",
          "effects": {
            "alert": 1,
            "access": 1
          }
        },
        {
          "id": "cut_cameras",
          "label": "Couper les caméras",
          "description": "Vous gagnez de l’intimité mais perdez un témoin neutre.",
          "effects": {
            "alert": -1,
            "evidence": -1
          }
        },
        {
          "id": "open_lockers",
          "label": "Ouvrir les casiers",
          "description": "Vous récupérez des objets privés, au risque de découvrir les secrets trop tôt.",
          "effects": {
            "items": 2,
            "trust": -1
          }
        }
      ],
      "discussionSeconds": 60,
      "decisionSeconds": 25,
      "timeout": {
        "narrative": "Les écrans prennent votre silence pour un refus. Les caméras se tournent vers vous et l’alerte augmente.",
        "effects": {
          "alert": 1,
          "time": -1
        }
      }
    },
    {
      "id": "sealed_reception",
      "chapter": 1,
      "number": 2,
      "title": "La réception scellée",
      "scene": [
        "Une vitre blindée sépare le groupe du bureau de l’archiviste. À l’intérieur, un téléphone sonne alors que le câble est arraché. Un badge jaune, une lampe UV et une enveloppe rouge sont visibles sur le bureau.",
        "Une personne peut passer seule par la trappe de maintenance. Les autres devront décider si elle mérite de revenir avec tout ce qu’elle trouve."
      ],
      "prompt": "Qui entre, et que promet cette personne ?",
      "mode": "targetedPrivate",
      "choices": [
        {
          "id": "share_all",
          "label": "Tout rapporter",
          "description": "Tu promets de remettre chaque objet au groupe.",
          "promise": "Tout rapporter"
        },
        {
          "id": "keep_one",
          "label": "Cacher un objet",
          "description": "Tu conserves secrètement un objet.",
          "betrayal": true,
          "secret": true
        },
        {
          "id": "swap_badge",
          "label": "Échanger un badge",
          "description": "Tu places le badge d’une autre personne dans le bureau.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "discussionSeconds": 50,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "La trappe se referme. Le badge reste inaccessible et le groupe perd du temps.",
        "effects": {
          "time": -1
        }
      }
    },
    {
      "id": "first_code",
      "chapter": 1,
      "number": 3,
      "title": "Le premier code",
      "scene": [
        "L’enveloppe rouge contient quatre phrases, chacune écrite avec une encre différente. Une seule est visible sous la lampe UV : « La vérité commence par le dossier que vous refusez d’ouvrir. »",
        "Le clavier demande un code à quatre chiffres. Trois indices sont répartis entre les joueurs. Ils peuvent les lire à voix haute, les résumer ou mentir sur leur contenu."
      ],
      "prompt": "Parviendrez-vous à assembler le code avant la purge ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "reveal",
          "label": "Lire son indice exactement",
          "description": "Le groupe progresse vers le vrai code.",
          "effects": {
            "access": 1,
            "trust": 1
          }
        },
        {
          "id": "summarize",
          "label": "Résumer sans tout montrer",
          "description": "Tu protèges une partie de ton information.",
          "secret": true
        },
        {
          "id": "alter",
          "label": "Modifier volontairement un chiffre",
          "description": "Tu risques d’envoyer le groupe vers un faux code.",
          "betrayal": true,
          "secret": true,
          "effects": {
            "alert": 1
          }
        }
      ],
      "discussionSeconds": 75,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "Le clavier se verrouille après trois tentatives. Une porte secondaire s’ouvre, mais l’alerte monte.",
        "effects": {
          "alert": 1,
          "time": -1,
          "access": 1
        }
      }
    },
    {
      "id": "choose_archive",
      "chapter": 2,
      "number": 4,
      "title": "Choisir l’aile",
      "scene": [
        "Trois portes s’ouvrent en même temps. À gauche, les archives judiciaires. En face, l’aile médicale. À droite, les dossiers financiers. Un voyant indique qu’une seule porte restera alimentée.",
        "Chaque aile promet une vérité différente. Le groupe ne saura jamais immédiatement ce qu’il a sacrifié en laissant les deux autres se refermer."
      ],
      "prompt": "Quelle vérité voulez-vous poursuivre en premier ?",
      "mode": "group",
      "choices": [
        {
          "id": "judicial",
          "label": "Archives judiciaires",
          "description": "Mandats, auditions et décisions signées.",
          "branch": "wing:judicial"
        },
        {
          "id": "medical",
          "label": "Archives médicales",
          "description": "Consentements, identités protégées et rapports de santé.",
          "branch": "wing:medical"
        },
        {
          "id": "financial",
          "label": "Archives financières",
          "description": "Virements, sociétés-écrans et bénéficiaires cachés.",
          "branch": "wing:financial"
        }
      ],
      "discussionSeconds": 80,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "Le système choisit l’aile judiciaire, la plus proche. Vous perdez la possibilité de décider votre première version.",
        "branch": "wing:judicial",
        "effects": {
          "time": -1
        }
      }
    },
    {
      "id": "investigation_tasks",
      "chapter": 2,
      "number": 5,
      "title": "Répartir les recherches",
      "scene": [
        "Les rayonnages sont trop vastes pour être fouillés ensemble. Trois tâches sont nécessaires : vérifier les signatures, retrouver l’index des pièces et surveiller le couloir.",
        "Les joueurs peuvent se répartir honnêtement, suivre discrètement quelqu’un ou laisser volontairement une tâche sans personne."
      ],
      "prompt": "Quelle tâche prends-tu réellement ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "signatures",
          "label": "Vérifier les signatures",
          "description": "Tu recherches les dates et les faux.",
          "effects": {
            "evidence": 1
          }
        },
        {
          "id": "index",
          "label": "Retrouver l’index",
          "description": "Tu identifies les pièces manquantes.",
          "effects": {
            "access": 1
          }
        },
        {
          "id": "watch",
          "label": "Surveiller le couloir",
          "description": "Tu protèges le groupe et observes les déplacements.",
          "effects": {
            "alert": -1
          }
        },
        {
          "id": "follow",
          "label": "Suivre une personne",
          "description": "Tu découvres peut-être son secret au lieu d’aider.",
          "requiresTarget": true,
          "secret": true
        }
      ],
      "discussionSeconds": 45,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "Le poste reste vide. Une caméra enregistre le groupe sans opposition.",
        "effects": {
          "alert": 1
        }
      }
    },
    {
      "id": "red_folder",
      "chapter": 2,
      "number": 6,
      "title": "Le dossier rouge",
      "scene": [
        "Un dossier rouge apparaît dans un tiroir qui était vide quelques secondes plus tôt. Sur la couverture, une photographie du groupe prise ce soir dans le hall. Au verso, une date vieille de six ans.",
        "Une seule personne découvre le contenu avant les autres : une liste de noms, dont le sien, reliés au dossier 42 par des annotations différentes."
      ],
      "prompt": "Que fait la personne qui a trouvé le dossier ?",
      "mode": "privateOne",
      "choices": [
        {
          "id": "show",
          "label": "Le montrer au groupe",
          "description": "La liste devient une preuve commune.",
          "effects": {
            "evidence": 1,
            "trust": 1
          }
        },
        {
          "id": "hide",
          "label": "Le cacher",
          "description": "Tu gardes une preuve et une information sur les autres.",
          "secret": true
        },
        {
          "id": "remove_page",
          "label": "Arracher une page avant de le montrer",
          "description": "Tu contrôles la version publique du document.",
          "betrayal": true,
          "secret": true
        }
      ],
      "decisionSeconds": 22,
      "timeout": {
        "narrative": "Le tiroir se verrouille autour du dossier. Seule la photographie reste visible.",
        "effects": {
          "evidence": -1
        }
      }
    },
    {
      "id": "testimony_fragments",
      "chapter": 3,
      "number": 7,
      "title": "Les fragments de témoignage",
      "scene": [
        "Chaque écran privé affiche quelques lignes d’une audition. Les voix ont été retranscrites sans nom. Plusieurs phrases se contredisent, mais certaines semblent répondre directement à ce que les joueurs viennent de dire.",
        "Le groupe peut reconstituer l’audition uniquement si chacun choisit de partager son fragment sans le modifier."
      ],
      "prompt": "Quelle version donnes-tu aux autres ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "exact",
          "label": "Lire le fragment mot pour mot",
          "description": "La transcription collective gagne en fiabilité.",
          "effects": {
            "evidence": 1,
            "trust": 1
          }
        },
        {
          "id": "partial",
          "label": "Retirer une phrase",
          "description": "Tu caches ce qui pourrait te concerner.",
          "secret": true
        },
        {
          "id": "rewrite",
          "label": "Réécrire un passage",
          "description": "Tu crées une contradiction ciblée.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "discussionSeconds": 90,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "Le fragment s’efface avant d’être lu. La transcription conservera un trou impossible à combler.",
        "effects": {
          "evidence": -1
        }
      }
    },
    {
      "id": "missing_page",
      "chapter": 3,
      "number": 8,
      "title": "La page 17",
      "scene": [
        "Toutes les références du dossier renvoient à une page 17 qui n’existe dans aucun classeur. Une imprimante se met pourtant en marche et produit une feuille presque blanche.",
        "La lampe UV révèle un nom et une heure. La personne qui tient la feuille peut la montrer, la remplacer par une copie préparée ou prétendre que rien n’est apparu."
      ],
      "prompt": "Que devient la page 17 ?",
      "mode": "targetedPrivate",
      "choices": [
        {
          "id": "publish",
          "label": "La rendre publique",
          "description": "Le groupe obtient une preuve vérifiable.",
          "effects": {
            "evidence": 1
          }
        },
        {
          "id": "keep",
          "label": "La conserver secrètement",
          "description": "Tu possèdes une preuve décisive.",
          "secret": true
        },
        {
          "id": "plant",
          "label": "La glisser dans le dossier de quelqu’un",
          "description": "Tu fabriques une preuve contre une personne.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "discussionSeconds": 35,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "La feuille chauffe dans l’imprimante et l’encre UV disparaît.",
        "effects": {
          "evidence": -1,
          "time": -1
        }
      }
    },
    {
      "id": "intercom_voice",
      "chapter": 3,
      "number": 9,
      "title": "La voix au standard",
      "scene": [
        "Le téléphone de la réception sonne dans tous les haut-parleurs. Une voix chuchote : « Ne publiez pas la page 17. Elle contient un vrai nom. » Puis elle prononce le prénom d’un joueur.",
        "Le groupe peut répondre, couper l’appel ou demander à la personne nommée de parler seule à la voix."
      ],
      "prompt": "Que faites-vous de cet appel ?",
      "mode": "group",
      "choices": [
        {
          "id": "answer_group",
          "label": "Répondre ensemble",
          "description": "La voix donne un indice, mais confirme votre présence.",
          "effects": {
            "evidence": 1,
            "alert": 1
          }
        },
        {
          "id": "named_alone",
          "label": "Laisser la personne nommée répondre seule",
          "description": "Cette personne reçoit un message privé.",
          "secret": true,
          "requiresActor": true
        },
        {
          "id": "cut",
          "label": "Couper le standard",
          "description": "Vous protégez l’identité du groupe, mais perdez une source.",
          "effects": {
            "alert": -1,
            "evidence": -1
          }
        }
      ],
      "discussionSeconds": 55,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "L’appel est transféré automatiquement vers une ligne extérieure. Quelqu’un sait désormais que vous êtes là.",
        "effects": {
          "alert": 1
        }
      }
    },
    {
      "id": "search_formation",
      "chapter": 4,
      "number": 10,
      "title": "Former l’équipe de recherche",
      "scene": [
        "Le couloir technique se divise en trois. Une caméra suit le groupe. Un lecteur de badge indique qu’une seule personne peut entrer dans la zone noire, mais les deux autres couloirs contiennent peut-être les commandes de sécurité.",
        "Rester ensemble limite les mensonges. Se séparer multiplie les découvertes. Envoyer une seule personne lui donne la possibilité de revenir avec sa propre version."
      ],
      "prompt": "Comment explorez-vous la salle absente ?",
      "mode": "group",
      "choices": [
        {
          "id": "together",
          "label": "Rester ensemble",
          "description": "Vous affrontez les systèmes comme un groupe.",
          "branch": "search:together"
        },
        {
          "id": "split",
          "label": "Se séparer",
          "description": "Vous ouvrez plusieurs zones mais perdez le contrôle des récits.",
          "branch": "search:split"
        },
        {
          "id": "lone",
          "label": "Envoyer une personne seule",
          "description": "Une personne entre dans la zone noire.",
          "branch": "search:lone",
          "requiresActor": true
        }
      ],
      "discussionSeconds": 75,
      "decisionSeconds": 22,
      "timeout": {
        "narrative": "Le système sélectionne automatiquement le badge le plus proche et enferme cette personne dans la zone noire.",
        "branch": "search:lone",
        "effects": {
          "alert": 1
        }
      }
    },
    {
      "id": "service_corridor",
      "chapter": 4,
      "number": 11,
      "title": "Le couloir de service",
      "scene": [
        "Le plafond descend lentement sous l’effet d’un mécanisme de confinement. Deux portes de secours sont visibles : l’une mène vers la salle absente, l’autre vers une sortie secondaire.",
        "Une personne peut maintenir le mécanisme pendant que les autres passent. Elle perdra une vie ou restera séparée du groupe si personne ne revient."
      ],
      "prompt": "Qui prend le risque, et vers quelle porte allez-vous ?",
      "mode": "group",
      "choices": [
        {
          "id": "hold_truth",
          "label": "Maintenir pour atteindre la salle",
          "description": "Une personne prend le risque pour les preuves.",
          "requiresActor": true,
          "effects": {
            "evidence": 1,
            "lifeLoss": 1
          }
        },
        {
          "id": "hold_exit",
          "label": "Maintenir pour ouvrir une sortie",
          "description": "Vous privilégiez l’évacuation.",
          "requiresActor": true,
          "effects": {
            "access": 1,
            "lifeLoss": 1
          }
        },
        {
          "id": "force_all",
          "label": "Forcer le mécanisme ensemble",
          "description": "Vous consommez un outil et gagnez du temps.",
          "effects": {
            "time": 1
          }
        },
        {
          "id": "retreat",
          "label": "Reculer",
          "description": "Personne ne souffre, mais l’alerte gagne du terrain.",
          "effects": {
            "alert": 1,
            "time": -1
          }
        }
      ],
      "discussionSeconds": 35,
      "decisionSeconds": 15,
      "timeout": {
        "narrative": "Le plafond tombe d’un cran. La personne la plus proche est séparée derrière une porte coupe-feu.",
        "effects": {
          "separatePlayer": true,
          "time": -1
        }
      }
    },
    {
      "id": "red_room",
      "chapter": 4,
      "number": 12,
      "title": "La salle rouge",
      "scene": [
        "La salle absente est tapissée de dossiers sans nom. Au centre, une table porte autant de casques audio qu’il y a de joueurs. Chaque casque contient une version différente de la même nuit.",
        "Le système propose de synchroniser les enregistrements, d’en écouter un seul ou de supprimer toutes les voix pour ne garder que les données techniques."
      ],
      "prompt": "Quelle forme de vérité acceptez-vous ?",
      "mode": "group",
      "choices": [
        {
          "id": "synchronize",
          "label": "Synchroniser les voix",
          "description": "Les contradictions deviennent visibles à tous.",
          "effects": {
            "evidence": 2,
            "alert": 1
          }
        },
        {
          "id": "one_voice",
          "label": "Écouter une seule version",
          "description": "Le groupe désigne une personne dont la version guidera la suite.",
          "requiresActor": true,
          "effects": {
            "trust": -1
          }
        },
        {
          "id": "technical_only",
          "label": "Supprimer les voix",
          "description": "Vous protégez les identités mais perdez le contexte humain.",
          "effects": {
            "evidence": 1,
            "alert": -1
          }
        }
      ],
      "discussionSeconds": 70,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "Les casques se lancent seuls, chacun à un volume différent. Le groupe n’entend que des fragments incompatibles.",
        "effects": {
          "evidence": -1,
          "trust": -1
        }
      }
    },
    {
      "id": "anonymous_evidence",
      "chapter": 5,
      "number": 13,
      "title": "La preuve anonyme",
      "scene": [
        "Une enveloppe passe sous la porte de la salle d’audition. Elle contient une photographie, un badge et une note : « Cette personne a déjà été ici. » Le nom a été masqué, mais certains détails permettent de viser plusieurs joueurs.",
        "Chacun peut présenter son interprétation, cacher une ressemblance ou utiliser un objet privé pour renforcer une accusation."
      ],
      "prompt": "Que dites-vous publiquement de cette preuve ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "honest",
          "label": "Donner son interprétation honnête",
          "description": "Tu aides à évaluer la preuve.",
          "effects": {
            "trust": 1
          }
        },
        {
          "id": "silence",
          "label": "Refuser de commenter",
          "description": "Tu ne renforces aucune version.",
          "secret": true
        },
        {
          "id": "frame",
          "label": "Faire correspondre la preuve à quelqu’un",
          "description": "Tu orientes le soupçon vers une personne précise.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "discussionSeconds": 90,
      "decisionSeconds": 22,
      "timeout": {
        "narrative": "Le système enregistre le silence comme un refus de coopérer et ajoute le joueur à la liste des suspects.",
        "effects": {
          "alert": 1
        }
      }
    },
    {
      "id": "tribunal",
      "chapter": 5,
      "number": 14,
      "title": "Le jugement",
      "scene": [
        "Le siège au centre de la salle s’allume. Le bâtiment réclame un nom. Les documents récoltés peuvent être montrés, cachés ou interprétés. Une accusation unanime ouvrira la porte suivante, mais une erreur donnera à la personne visée un pouvoir de revanche.",
        "Refuser de désigner quelqu’un évite un sacrifice immédiat, au prix d’une nouvelle procédure imposée par le Centre."
      ],
      "prompt": "Désignez-vous une personne, refusez-vous ou accusez-vous le système ?",
      "mode": "vote",
      "choices": [
        {
          "id": "accuse",
          "label": "Accuser une personne",
          "description": "Le groupe choisit un nom.",
          "requiresTarget": true
        },
        {
          "id": "system",
          "label": "Accuser le Centre Valmont",
          "description": "Vous refusez de faire d’un joueur le coupable.",
          "branch": "verdict:unresolved"
        },
        {
          "id": "refuse",
          "label": "Refuser de voter",
          "description": "Le silence déclenche une procédure automatique.",
          "branch": "verdict:unresolved"
        }
      ],
      "discussionSeconds": 110,
      "decisionSeconds": 25,
      "timeout": {
        "narrative": "Le siège sélectionne la personne ayant reçu le plus de soupçons invisibles. Le verdict est imposé.",
        "effects": {
          "forcedVerdict": true,
          "trust": -2
        }
      }
    },
    {
      "id": "lockdown",
      "chapter": 5,
      "number": 15,
      "title": "Le verrouillage",
      "scene": [
        "Après le verdict, les lumières passent au rouge. Une sirène annonce l’effacement anticipé du dossier. Il reste assez de courant pour protéger une seule chose : les joueurs, les preuves ou l’accès au serveur.",
        "Le choix doit être validé avant la fin de la sirène. Sans accord, le système protégera sa propre infrastructure."
      ],
      "prompt": "Que protégez-vous pendant le verrouillage ?",
      "mode": "group",
      "choices": [
        {
          "id": "people",
          "label": "Protéger les joueurs",
          "description": "Personne ne perd de vie pendant la fermeture.",
          "effects": {
            "alert": 1
          }
        },
        {
          "id": "evidence",
          "label": "Protéger les preuves",
          "description": "Les documents collectés survivent à la purge locale.",
          "effects": {
            "evidence": 1
          }
        },
        {
          "id": "server",
          "label": "Protéger l’accès au serveur",
          "description": "La route vers le protocole d’effacement reste ouverte.",
          "effects": {
            "access": 1
          }
        }
      ],
      "discussionSeconds": 35,
      "decisionSeconds": 15,
      "timeout": {
        "narrative": "Le système protège le serveur et enferme une personne dans la salle d’audition.",
        "effects": {
          "separatePlayer": true,
          "alert": 1
        }
      }
    },
    {
      "id": "central_system",
      "chapter": 6,
      "number": 16,
      "title": "Les trois systèmes",
      "scene": [
        "Le serveur central propose trois commandes : diffusion satellite, déverrouillage général et restauration des caméras. L’énergie restante ne permet qu’une activation complète.",
        "Chaque commande crée une fin possible différente. Le groupe peut encore discuter, mais la personne qui possède la clé chiffrée aura le dernier geste."
      ],
      "prompt": "Quel système activez-vous ?",
      "mode": "group",
      "choices": [
        {
          "id": "broadcast",
          "label": "Diffusion satellite",
          "description": "Préparez la publication du dossier.",
          "branch": "system:broadcast"
        },
        {
          "id": "unlock",
          "label": "Déverrouillage général",
          "description": "Ouvrez des routes de sortie.",
          "branch": "system:unlock"
        },
        {
          "id": "cameras",
          "label": "Restaurer les caméras",
          "description": "Révélez les déplacements et les mensonges.",
          "branch": "system:cameras"
        }
      ],
      "discussionSeconds": 95,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "Le serveur lance automatiquement la restauration des caméras, la fonction jugée prioritaire par le protocole.",
        "branch": "system:cameras",
        "effects": {
          "time": -1
        }
      }
    },
    {
      "id": "dossier_42",
      "chapter": 6,
      "number": 17,
      "title": "Le dossier 42",
      "scene": [
        "Le fichier central s’ouvre enfin. Il contient les preuves recherchées, mais aussi les dossiers personnels des joueurs : anciennes plaintes, liens familiaux, transactions, photos et conversations privées.",
        "Publier le tout garantirait l’authenticité de la preuve, mais exposerait tout le monde. Extraire seulement le dossier 42 protégerait les joueurs, au risque de laisser croire à un montage."
      ],
      "prompt": "Quelle version préparez-vous ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "full",
          "label": "Autoriser la publication complète",
          "description": "Tu acceptes que tes propres secrets servent d’authentification.",
          "effects": {
            "evidence": 1
          }
        },
        {
          "id": "redacted",
          "label": "Demander une version expurgée",
          "description": "Tu protèges tes données personnelles.",
          "effects": {
            "alert": -1
          }
        },
        {
          "id": "replace",
          "label": "Remplacer une pièce",
          "description": "Tu modifies la version finale pour protéger ou accuser quelqu’un.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "discussionSeconds": 85,
      "decisionSeconds": 22,
      "timeout": {
        "narrative": "Le serveur conserve la version complète par défaut. Les secrets personnels restent attachés au dossier.",
        "effects": {
          "evidence": 1,
          "personalExposure": true
        }
      }
    },
    {
      "id": "trapped_person",
      "chapter": 6,
      "number": 18,
      "title": "La personne enfermée",
      "scene": [
        "Une porte coupe-feu se ferme avant que tout le monde ne rejoigne le serveur. La personne la plus affaiblie reste de l’autre côté avec une copie partielle du dossier.",
        "Le groupe peut dépenser du temps pour la libérer, lui demander de détruire sa copie ou poursuivre en la laissant négocier seule avec le système."
      ],
      "prompt": "Que faites-vous de la personne enfermée ?",
      "mode": "group",
      "choices": [
        {
          "id": "rescue",
          "label": "Organiser le sauvetage",
          "description": "Vous perdez du temps mais refusez de l’abandonner.",
          "effects": {
            "time": -1,
            "trust": 2
          }
        },
        {
          "id": "destroy_copy",
          "label": "Lui demander de détruire sa copie",
          "description": "Vous protégez la version collective, au prix d’une trahison possible.",
          "effects": {
            "evidence": -1
          }
        },
        {
          "id": "leave",
          "label": "Poursuivre sans elle",
          "description": "La personne reçoit une route secrète et un choix de revanche.",
          "betrayal": true,
          "effects": {
            "trust": -2
          }
        },
        {
          "id": "sacrifice",
          "label": "Une personne échange sa place",
          "description": "Un volontaire reste à sa place.",
          "requiresActor": true,
          "effects": {
            "lifeLoss": 1,
            "trust": 2
          }
        }
      ],
      "discussionSeconds": 50,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "La liaison se coupe. La personne enfermée est désormais seule avec la copie et sa propre version des événements.",
        "effects": {
          "separatePlayer": true,
          "time": -1
        }
      }
    },
    {
      "id": "exit_routes",
      "chapter": 7,
      "number": 19,
      "title": "Les routes disponibles",
      "scene": [
        "Trois sorties apparaissent sur le plan : l’ascenseur principal, le tunnel de livraison et une liaison distante permettant d’envoyer le dossier sans sortir. Chaque route exige une ressource différente.",
        "L’ascenseur est rapide mais surveillé. Le tunnel peut transporter tout le monde si le badge maître existe. La liaison distante sauve les preuves, pas forcément les joueurs."
      ],
      "prompt": "Quelle sortie préparez-vous ?",
      "mode": "group",
      "choices": [
        {
          "id": "elevator",
          "label": "Ascenseur principal",
          "description": "Rapide, visible et limité si l’alerte est élevée."
        },
        {
          "id": "tunnel",
          "label": "Tunnel de livraison",
          "description": "Plus lent, mais discret si l’accès est suffisant."
        },
        {
          "id": "remote",
          "label": "Transmission distante",
          "description": "Publiez sans attendre de sortir."
        },
        {
          "id": "stay",
          "label": "Rester et négocier",
          "description": "Tentez de forcer une reconnaissance officielle."
        }
      ],
      "discussionSeconds": 85,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "L’ascenseur est appelé automatiquement. Ses caméras enregistrent chaque visage.",
        "effects": {
          "alert": 1
        },
        "choice": "elevator"
      }
    },
    {
      "id": "final_disclosure",
      "chapter": 7,
      "number": 20,
      "title": "Le dernier engagement",
      "scene": [
        "Avant l’ouverture de la sortie, chaque joueur reçoit une décision privée. Les promesses faites pendant la partie apparaissent sur l’écran, suivies d’une dernière question : « Les respectez-vous maintenant ? »",
        "Une personne peut attendre tout le monde, partir avec la copie, donner son accès à quelqu’un, publier les secrets du groupe ou effacer sa propre trace."
      ],
      "prompt": "Que fais-tu lorsque personne ne peut vérifier ton geste ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "wait",
          "label": "Attendre tout le groupe",
          "description": "Tu refuses une sortie individuelle.",
          "effects": {
            "trust": 1
          }
        },
        {
          "id": "leave_copy",
          "label": "Partir avec la copie",
          "description": "Tu garantis ta sortie et conserves les preuves.",
          "secret": true
        },
        {
          "id": "give_access",
          "label": "Donner ton accès",
          "description": "Tu choisis une personne à protéger.",
          "requiresTarget": true,
          "secret": true
        },
        {
          "id": "expose",
          "label": "Publier tous les secrets",
          "description": "Tu rends le dossier incontestable, mais exposes tout le monde.",
          "betrayal": true,
          "secret": true
        },
        {
          "id": "erase_self",
          "label": "Effacer ta propre trace",
          "description": "Tu protèges ton identité au risque de fragiliser la preuve.",
          "secret": true
        }
      ],
      "discussionSeconds": 70,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "Le système interprète l’inaction comme un accord de publication complète.",
        "effects": {
          "personalExposure": true,
          "evidence": 1
        }
      }
    },
    {
      "id": "last_broadcast",
      "chapter": 7,
      "number": 21,
      "title": "La dernière version",
      "scene": [
        "Les lumières s’éteignent étage par étage. Une barre de progression annonce l’envoi ou l’effacement du dossier. Les joueurs ne savent pas encore quelle version a été préparée par les gestes privés.",
        "Il reste quelques secondes pour maintenir la transmission, arracher le support de données ou abandonner les preuves afin d’ouvrir toutes les portes."
      ],
      "prompt": "Quel prix acceptez-vous pour votre version finale ?",
      "mode": "group",
      "choices": [
        {
          "id": "maintain",
          "label": "Maintenir la transmission",
          "description": "Une personne peut devoir rester derrière.",
          "requiresActor": true
        },
        {
          "id": "take_drive",
          "label": "Arracher le support",
          "description": "Une copie physique survit, mais la diffusion échoue."
        },
        {
          "id": "open_doors",
          "label": "Sacrifier les preuves",
          "description": "Toutes les portes s’ouvrent, le dossier est effacé."
        },
        {
          "id": "trust_system",
          "label": "Laisser le protocole finir",
          "description": "Le résultat dépend des preuves, des sabotages et de l’alerte."
        }
      ],
      "discussionSeconds": 30,
      "decisionSeconds": 12,
      "timeout": {
        "narrative": "La barre atteint 100 %. Le système applique la version préparée sans vous demander de confirmation.",
        "effects": {
          "autoFinal": true
        }
      }
    },
    {
      "id": "wing_judicial",
      "chapter": 2,
      "number": 40,
      "title": "Le mandat impossible",
      "scene": [
        "Dans l’aile judiciaire, un mandat porte la signature d’un magistrat mort trois jours avant sa date d’émission. Au dos, une note manuscrite demande de protéger le nom du témoin à tout prix.",
        "Le groupe peut authentifier la fraude, utiliser le faux mandat pour ouvrir une salle ou le placer dans les affaires d’un joueur."
      ],
      "prompt": "Que faites-vous du mandat ?",
      "mode": "targetedPrivate",
      "choices": [
        {
          "id": "authenticate",
          "label": "Prouver la falsification",
          "description": "Vous gagnez une preuve solide.",
          "effects": {
            "evidence": 2
          }
        },
        {
          "id": "use_key",
          "label": "L’utiliser comme clé",
          "description": "Le mandat ouvre une salle scellée.",
          "effects": {
            "access": 1
          }
        },
        {
          "id": "plant",
          "label": "Le placer chez quelqu’un",
          "description": "Vous préparez un futur bouc émissaire.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "branch": "wing:judicial",
      "discussionSeconds": 45,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "Le scanner confisque le mandat et enregistre le badge de la personne la plus proche.",
        "effects": {
          "alert": 1
        }
      }
    },
    {
      "id": "wing_medical",
      "chapter": 2,
      "number": 41,
      "title": "Le consentement effacé",
      "scene": [
        "Les archives médicales contiennent un formulaire de consentement dont le nom a été retiré chimiquement. Le dossier indique qu’une identité protégée a été créée après l’incident 42.",
        "Révéler l’identité renforcerait la preuve, mais pourrait mettre le témoin en danger. La cacher préserverait une personne tout en laissant un trou dans le récit."
      ],
      "prompt": "Jusqu’où allez-vous protéger l’identité ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "protect",
          "label": "Protéger le nom",
          "description": "Tu gardes l’identité hors du dossier public.",
          "secret": true
        },
        {
          "id": "reveal",
          "label": "Révéler le nom",
          "description": "Tu renforces la preuve au prix d’une exposition.",
          "effects": {
            "evidence": 1,
            "alert": 1
          }
        },
        {
          "id": "swap",
          "label": "Remplacer le nom",
          "description": "Tu places une autre identité sur le consentement.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "branch": "wing:medical",
      "discussionSeconds": 70,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "Le système restaure automatiquement le nom complet et l’ajoute au dossier central.",
        "effects": {
          "evidence": 1,
          "alert": 1
        }
      }
    },
    {
      "id": "wing_financial",
      "chapter": 2,
      "number": 42,
      "title": "Le coffre des bénéficiaires",
      "scene": [
        "Un coffre contient les noms des bénéficiaires de plusieurs virements. L’un d’eux ressemble au nom d’un joueur, mais le document peut désigner un homonyme.",
        "Le coffre contient aussi une clé chiffrée permettant de copier le dossier complet sur un support personnel."
      ],
      "prompt": "Que sortez-vous réellement du coffre ?",
      "mode": "privateOne",
      "choices": [
        {
          "id": "ledger",
          "label": "Le registre des virements",
          "description": "Le groupe obtient une piste financière.",
          "effects": {
            "evidence": 2
          }
        },
        {
          "id": "key",
          "label": "La clé chiffrée",
          "description": "Tu obtiens le moyen de créer une copie unique.",
          "secret": true
        },
        {
          "id": "both_hide",
          "label": "Prendre les deux et mentir",
          "description": "Tu contrôles la preuve et la copie.",
          "betrayal": true,
          "secret": true
        }
      ],
      "branch": "wing:financial",
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "Le coffre se referme. Seule la clé chiffrée tombe au sol.",
        "effects": {
          "item": "Clé chiffrée"
        }
      }
    },
    {
      "id": "search_together",
      "chapter": 4,
      "number": 43,
      "title": "La boucle des caméras",
      "scene": [
        "En restant ensemble, le groupe voit la même caméra diffuser ses propres mouvements avec trente secondes d’avance. L’image montre une personne quitter le groupe, alors que personne n’a encore bougé.",
        "Le groupe peut suivre la prédiction, l’empêcher ou utiliser la boucle pour tromper la sécurité."
      ],
      "prompt": "Faites-vous confiance à une image du futur ?",
      "mode": "group",
      "choices": [
        {
          "id": "follow",
          "label": "Suivre la séquence",
          "description": "Vous reproduisez l’image et ouvrez le passage.",
          "effects": {
            "access": 1,
            "alert": 1
          }
        },
        {
          "id": "break",
          "label": "Briser la séquence",
          "description": "Vous restez unis mais perdez du temps.",
          "effects": {
            "time": -1,
            "trust": 1
          }
        },
        {
          "id": "fake",
          "label": "Jouer une fausse scène",
          "description": "Vous trompez les caméras si tout le monde coopère.",
          "effects": {
            "alert": -1,
            "trust": 1
          }
        }
      ],
      "branch": "search:together",
      "discussionSeconds": 55,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "La scène se réalise exactement : une personne est isolée derrière la porte.",
        "effects": {
          "separatePlayer": true
        }
      }
    },
    {
      "id": "search_split",
      "chapter": 4,
      "number": 44,
      "title": "Le badge en double",
      "scene": [
        "Les deux équipes trouvent simultanément le même badge portant le même numéro. L’un est forcément faux. Chaque équipe peut tester le sien ou accuser l’autre d’avoir remplacé le badge.",
        "Les décisions sont prises séparément. Les deux groupes ne verront les conséquences qu’une fois réunis."
      ],
      "prompt": "Que fait chaque équipe de son badge ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "test",
          "label": "Tester le badge",
          "description": "Tu risques l’alarme mais vérifies l’objet.",
          "effects": {
            "access": 1
          }
        },
        {
          "id": "hide",
          "label": "Le cacher",
          "description": "Tu conserves un accès privé.",
          "secret": true
        },
        {
          "id": "swap",
          "label": "L’échanger avec celui de quelqu’un",
          "description": "Tu lui transmets peut-être le faux badge.",
          "betrayal": true,
          "requiresTarget": true,
          "secret": true
        }
      ],
      "branch": "search:split",
      "discussionSeconds": 40,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "Le lecteur teste automatiquement les deux badges. L’un déclenche l’alarme.",
        "effects": {
          "alert": 1
        }
      }
    },
    {
      "id": "search_lone",
      "chapter": 4,
      "number": 45,
      "title": "La cabine noire",
      "scene": [
        "La personne envoyée seule entre dans une cabine sans caméra. Un écran lui propose un marché : ouvrir la salle rouge pour tous, ou recevoir une copie privée du dossier en échange de la fermeture d’un autre passage.",
        "Le groupe ne saura pas quel marché a été proposé. Il ne verra que la porte qui s’ouvrira ensuite."
      ],
      "prompt": "Quel marché acceptes-tu ?",
      "mode": "privateOne",
      "choices": [
        {
          "id": "open_all",
          "label": "Ouvrir pour tous",
          "description": "Tu privilégies le groupe.",
          "effects": {
            "access": 1,
            "trust": 1
          }
        },
        {
          "id": "private_copy",
          "label": "Recevoir une copie privée",
          "description": "Tu obtiens une preuve unique et fermes une route.",
          "secret": true,
          "betrayal": true
        },
        {
          "id": "name_other",
          "label": "Donner le nom d’une autre personne",
          "description": "Tu ouvres la porte en plaçant quelqu’un sous surveillance.",
          "requiresTarget": true,
          "secret": true,
          "betrayal": true
        }
      ],
      "branch": "search:lone",
      "decisionSeconds": 22,
      "timeout": {
        "narrative": "Le système choisit le marché le plus sûr pour lui : la personne reçoit une copie et le passage collectif se ferme.",
        "effects": {
          "secretCopy": true,
          "access": -1
        }
      }
    },
    {
      "id": "verdict_false",
      "chapter": 5,
      "number": 46,
      "title": "Le droit de revanche",
      "scene": [
        "La personne accusée découvre qu’une preuve utilisée contre elle était fausse ou insuffisante. Le système lui offre un droit de revanche : prendre l’accès de quelqu’un, révéler un secret ou pardonner publiquement.",
        "Son choix reste privé jusqu’à la prochaine porte."
      ],
      "prompt": "Comment réponds-tu à l’accusation injuste ?",
      "mode": "privateOne",
      "choices": [
        {
          "id": "forgive",
          "label": "Pardonner",
          "description": "Tu empêches l’effondrement du groupe.",
          "effects": {
            "trust": 2
          }
        },
        {
          "id": "take_access",
          "label": "Prendre un accès",
          "description": "Tu retires une priorité de sortie à une personne.",
          "requiresTarget": true,
          "secret": true,
          "betrayal": true
        },
        {
          "id": "reveal_secret",
          "label": "Révéler un secret",
          "description": "Tu exposes une information privée du groupe.",
          "requiresTarget": true,
          "betrayal": true
        }
      ],
      "branch": "verdict:false",
      "decisionSeconds": 25,
      "timeout": {
        "narrative": "Le système choisit la revanche la plus directe et retire l’accès au principal accusateur.",
        "effects": {
          "trust": -2
        }
      }
    },
    {
      "id": "verdict_correct",
      "chapter": 5,
      "number": 47,
      "title": "La taupe acculée",
      "scene": [
        "Les preuves convergent vers une personne réellement liée au sabotage. Elle reçoit quelques secondes pour avouer, produire une fausse preuve ou déclencher son dernier sabotage.",
        "Le groupe ne sait pas si l’aveu sera complet ou calculé."
      ],
      "prompt": "Que fait la personne acculée ?",
      "mode": "privateOne",
      "choices": [
        {
          "id": "confess",
          "label": "Avouer partiellement",
          "description": "Tu révèles le sabotage sans expliquer toute ta mission.",
          "secret": true
        },
        {
          "id": "frame",
          "label": "Produire une fausse preuve",
          "description": "Tu transfères le soupçon vers quelqu’un.",
          "requiresTarget": true,
          "secret": true,
          "betrayal": true
        },
        {
          "id": "emergency_sabotage",
          "label": "Saboter immédiatement",
          "description": "Tu détruis une preuve ou bloques une sortie.",
          "secret": true,
          "betrayal": true
        }
      ],
      "branch": "verdict:correct",
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "Le protocole de sabotage automatique détruit la pièce la plus récente.",
        "effects": {
          "evidence": -1
        }
      }
    },
    {
      "id": "verdict_unresolved",
      "chapter": 5,
      "number": 48,
      "title": "La présidence d’urgence",
      "scene": [
        "Le groupe a refusé de désigner un coupable. Le Centre exige alors un responsable temporaire doté d’un vote décisif pour la suite.",
        "Choisir une personne peut stabiliser le groupe ou donner un pouvoir considérable à quelqu’un qui prépare déjà sa propre sortie."
      ],
      "prompt": "Qui reçoit le pouvoir temporaire ?",
      "mode": "vote",
      "choices": [
        {
          "id": "elect",
          "label": "Élire une personne",
          "description": "Le joueur choisi départagera la prochaine décision.",
          "requiresTarget": true
        },
        {
          "id": "random",
          "label": "Tirer au sort",
          "description": "Le système choisit sans tenir compte de la confiance."
        },
        {
          "id": "no_leader",
          "label": "Refuser encore",
          "description": "Le temps diminue, mais personne ne domine.",
          "effects": {
            "time": -1
          }
        }
      ],
      "branch": "verdict:unresolved",
      "discussionSeconds": 60,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "Le système nomme la personne dont le badge a été le plus utilisé.",
        "effects": {
          "temporaryLeader": true
        }
      }
    },
    {
      "id": "system_broadcast",
      "chapter": 6,
      "number": 49,
      "title": "La fenêtre de diffusion",
      "scene": [
        "La liaison satellite ne restera ouverte que quatre-vingt-dix secondes. Le groupe peut envoyer le dossier complet, une version expurgée ou un leurre destiné à identifier ceux qui surveillent la fréquence.",
        "Une version complète protège la vérité mais expose les joueurs. Une version expurgée peut être contestée. Le leurre ouvre un autre type de piège."
      ],
      "prompt": "Que diffusez-vous ?",
      "mode": "group",
      "choices": [
        {
          "id": "complete",
          "label": "Le dossier complet",
          "description": "Preuve maximale, exposition maximale.",
          "effects": {
            "evidence": 2,
            "alert": 2
          }
        },
        {
          "id": "redacted",
          "label": "Une version expurgée",
          "description": "Vous protégez les identités mais perdez en force.",
          "effects": {
            "evidence": 1
          }
        },
        {
          "id": "decoy",
          "label": "Un leurre",
          "description": "Vous identifiez une réponse extérieure, au risque de rater la fenêtre.",
          "effects": {
            "alert": 1
          }
        }
      ],
      "branch": "system:broadcast",
      "discussionSeconds": 55,
      "decisionSeconds": 16,
      "timeout": {
        "narrative": "La version complète part automatiquement avec toutes les données personnelles.",
        "effects": {
          "evidence": 2,
          "alert": 2,
          "personalExposure": true
        }
      }
    },
    {
      "id": "system_unlock",
      "chapter": 6,
      "number": 50,
      "title": "Les places de sortie",
      "scene": [
        "Le déverrouillage général révèle que l’ascenseur n’accepte pas forcément tout le groupe lorsque l’alerte est élevée. Des accès individuels peuvent être réservés ou cédés.",
        "Chaque joueur peut libérer une place, en prendre une ou réserver un accès à quelqu’un. Les choix restent privés."
      ],
      "prompt": "Que fais-tu de ton accès ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "free",
          "label": "Le laisser collectif",
          "description": "Tu ne réserves aucune priorité.",
          "effects": {
            "trust": 1
          }
        },
        {
          "id": "claim",
          "label": "Le réserver pour toi",
          "description": "Tu garantis ta priorité si les places manquent.",
          "secret": true
        },
        {
          "id": "give",
          "label": "Le réserver à quelqu’un",
          "description": "Tu protèges une personne précise.",
          "requiresTarget": true,
          "secret": true
        },
        {
          "id": "disable",
          "label": "Rendre un autre accès inutilisable",
          "description": "Tu élimines une priorité concurrente.",
          "requiresTarget": true,
          "secret": true,
          "betrayal": true
        }
      ],
      "branch": "system:unlock",
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "L’accès reste attribué à son propriétaire actuel.",
        "effects": {
          "claimSelf": true
        }
      }
    },
    {
      "id": "system_cameras",
      "chapter": 6,
      "number": 51,
      "title": "Les mouvements révélés",
      "scene": [
        "Les caméras restaurées affichent les déplacements secrets : qui est entré dans quel bureau, qui a glissé une page dans un sac, qui a attendu devant la salle rouge.",
        "Le système peut révéler toutes les images, uniquement celles liées au dossier, ou permettre à une personne de supprimer une séquence."
      ],
      "prompt": "Jusqu’où ouvrez-vous les archives vidéo ?",
      "mode": "group",
      "choices": [
        {
          "id": "all",
          "label": "Tout révéler",
          "description": "Les trahisons visibles sont exposées, ainsi que des secrets privés.",
          "effects": {
            "evidence": 2,
            "trust": -1
          }
        },
        {
          "id": "case_only",
          "label": "Seulement le dossier 42",
          "description": "Vous obtenez les preuves pertinentes.",
          "effects": {
            "evidence": 1
          }
        },
        {
          "id": "delete_one",
          "label": "Autoriser une suppression",
          "description": "Une personne peut effacer sa séquence.",
          "requiresActor": true,
          "secret": true
        }
      ],
      "branch": "system:cameras",
      "discussionSeconds": 70,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "Le système diffuse toutes les images sans filtre.",
        "effects": {
          "evidence": 2,
          "trust": -2,
          "personalExposure": true
        }
      }
    },
    {
      "id": "secondary_blackout",
      "chapter": 2,
      "number": 60,
      "title": "La coupure",
      "scene": [
        "Le courant disparaît pendant vingt secondes. Dans le noir, un tiroir s’ouvre et un objet change de place.",
        "Au retour de la lumière, chacun doit décider s’il révèle ce qu’il a touché."
      ],
      "prompt": "Que dis-tu de ces vingt secondes ?",
      "mode": "privateEach",
      "choices": [
        {
          "id": "truth",
          "label": "Dire exactement ce que tu as fait",
          "description": "Tu renforces la confiance."
        },
        {
          "id": "hide",
          "label": "Cacher ton geste",
          "description": "Ton action reste inconnue.",
          "secret": true
        },
        {
          "id": "steal",
          "label": "Prendre un objet privé",
          "description": "Tu voles une personne précise.",
          "requiresTarget": true,
          "secret": true,
          "betrayal": true
        }
      ],
      "secondary": true,
      "decisionSeconds": 15,
      "timeout": {
        "narrative": "Le système considère que personne n’a rien déclaré.",
        "effects": {}
      }
    },
    {
      "id": "secondary_gas",
      "chapter": 3,
      "number": 61,
      "title": "Le gaz de sécurité",
      "scene": [
        "Une odeur métallique traverse les aérations. Les masques filtrants sont moins nombreux que les joueurs.",
        "Le groupe peut partager, désigner des priorités ou couper l’aération au risque de perdre du temps."
      ],
      "prompt": "Qui reçoit les protections ?",
      "mode": "group",
      "choices": [
        {
          "id": "share",
          "label": "Partager les masques",
          "description": "Tout le monde subit un effet léger."
        },
        {
          "id": "priority",
          "label": "Protéger certains joueurs",
          "description": "Le groupe désigne des priorités.",
          "requiresActor": true
        },
        {
          "id": "vent",
          "label": "Couper l’aération",
          "description": "Vous perdez du temps mais protégez tout le monde.",
          "effects": {
            "time": -1
          }
        }
      ],
      "secondary": true,
      "discussionSeconds": 35,
      "decisionSeconds": 12,
      "timeout": {
        "narrative": "Les plus proches prennent les masques. Une personne perd une vie.",
        "effects": {
          "lifeLoss": 1
        }
      }
    },
    {
      "id": "secondary_outside_call",
      "chapter": 3,
      "number": 62,
      "title": "L’appel extérieur",
      "scene": [
        "Un téléphone personnel reçoit un appel malgré l’absence de réseau. La voix affirme être la journaliste qui a envoyé la convocation.",
        "Elle demande une seule preuve avant de révéler une sortie."
      ],
      "prompt": "Que lui envoyez-vous ?",
      "mode": "privateOne",
      "choices": [
        {
          "id": "real",
          "label": "Une vraie preuve",
          "description": "Vous obtenez une piste de sortie.",
          "effects": {
            "access": 1,
            "alert": 1
          }
        },
        {
          "id": "fake",
          "label": "Une fausse preuve",
          "description": "Vous testez la voix, mais risquez de perdre sa confiance."
        },
        {
          "id": "nothing",
          "label": "Rien",
          "description": "Vous gardez le contrôle du dossier."
        }
      ],
      "secondary": true,
      "decisionSeconds": 20,
      "timeout": {
        "narrative": "L’appel se coupe et ne reviendra pas.",
        "effects": {}
      }
    },
    {
      "id": "secondary_envelope",
      "chapter": 4,
      "number": 63,
      "title": "L’enveloppe sous la porte",
      "scene": [
        "Une enveloppe contient une photographie de l’incident 42 et une phrase : « Demande à la personne qui ne regarde jamais la caméra. »",
        "Le groupe doit décider si cette phrase est un indice ou une tentative de division."
      ],
      "prompt": "Que faites-vous de l’enveloppe ?",
      "mode": "group",
      "choices": [
        {
          "id": "compare",
          "label": "Comparer avec les vidéos",
          "description": "Vous gagnez un indice."
        },
        {
          "id": "accuse",
          "label": "Accuser une personne",
          "description": "Vous créez un soupçon ciblé.",
          "requiresActor": true
        },
        {
          "id": "destroy",
          "label": "La détruire",
          "description": "Vous refusez la manipulation."
        }
      ],
      "secondary": true,
      "discussionSeconds": 45,
      "decisionSeconds": 16,
      "timeout": {
        "narrative": "L’enveloppe est aspirée sous la porte opposée.",
        "effects": {}
      }
    },
    {
      "id": "secondary_bodycam",
      "chapter": 5,
      "number": 64,
      "title": "La caméra corporelle",
      "scene": [
        "Une vieille caméra contient douze secondes de vidéo. On y voit une main placer un document dans un sac, sans visage visible.",
        "Une personne peut tenter d’identifier la main, couper la vidéo ou la conserver secrètement."
      ],
      "prompt": "Qui contrôle l’enregistrement ?",
      "mode": "targetedPrivate",
      "choices": [
        {
          "id": "show",
          "label": "Le montrer à tous",
          "description": "Le groupe obtient une preuve ambiguë."
        },
        {
          "id": "analyze",
          "label": "L’analyser seul",
          "description": "Tu reçois un indice privé.",
          "secret": true
        },
        {
          "id": "erase",
          "label": "L’effacer",
          "description": "La vidéo disparaît.",
          "betrayal": true,
          "secret": true
        }
      ],
      "secondary": true,
      "decisionSeconds": 18,
      "timeout": {
        "narrative": "La batterie s’épuise et la vidéo devient illisible.",
        "effects": {}
      }
    },
    {
      "id": "secondary_photo",
      "chapter": 6,
      "number": 65,
      "title": "La photographie datée de demain",
      "scene": [
        "Une imprimante produit une photo du groupe quittant le Centre. La date affichée est celle du lendemain, mais une silhouette manque.",
        "Le groupe peut suivre la disposition de la photo, la rejeter ou tenter d’identifier la personne absente."
      ],
      "prompt": "La photo annonce-t-elle votre avenir ?",
      "mode": "group",
      "choices": [
        {
          "id": "follow",
          "label": "Reproduire la disposition",
          "description": "Vous gagnez un accès mais acceptez la prédiction."
        },
        {
          "id": "identify",
          "label": "Identifier la silhouette absente",
          "description": "Vous ciblez une personne.",
          "requiresActor": true
        },
        {
          "id": "destroy",
          "label": "Détruire la photo",
          "description": "Vous refusez d’être guidés."
        }
      ],
      "secondary": true,
      "discussionSeconds": 40,
      "decisionSeconds": 15,
      "timeout": {
        "narrative": "Le système associe la silhouette absente à la personne la plus isolée.",
        "effects": {
          "alert": 1
        }
      }
    },
    {
      "id": "secondary_cooling",
      "chapter": 6,
      "number": 66,
      "title": "Le refroidissement du serveur",
      "scene": [
        "Le serveur surchauffe. Il faut choisir entre refroidir les preuves, les portes ou les caméras.",
        "Une mauvaise décision peut supprimer une route entière."
      ],
      "prompt": "Quel système maintenez-vous en vie ?",
      "mode": "group",
      "choices": [
        {
          "id": "evidence",
          "label": "Les preuves",
          "description": "Le dossier reste intact."
        },
        {
          "id": "doors",
          "label": "Les portes",
          "description": "La sortie reste accessible."
        },
        {
          "id": "cameras",
          "label": "Les caméras",
          "description": "Les mouvements restent vérifiables."
        }
      ],
      "secondary": true,
      "discussionSeconds": 25,
      "decisionSeconds": 10,
      "timeout": {
        "narrative": "Le refroidissement protège les portes par défaut. Une partie des preuves se corrompt.",
        "effects": {
          "evidence": -1
        }
      }
    }
  ],
  "items": [
    "Badge jaune",
    "Badge maître",
    "Lampe UV",
    "Clé chiffrée",
    "Fragment audio",
    "Page 17",
    "Photo brûlée",
    "Enveloppe rouge",
    "Copie chiffrée",
    "Mini-enregistreur",
    "Dossier médical",
    "Mandat signé",
    "Clé du coffre",
    "Téléphone hors réseau",
    "Batterie externe",
    "Masque filtrant",
    "Câble fibre",
    "Carte des conduits",
    "Sceau officiel",
    "Jeton ascenseur"
  ],
  "endings": [
    {
      "id": "truth_daylight",
      "title": "La vérité au grand jour",
      "icon": "☀️",
      "conditions": [
        "Preuves ≥ 4",
        "Diffusion réussie ou copie authentifiée",
        "Aucun sabotage final réussi"
      ],
      "summary": "Le dossier 42 est publié avec suffisamment de preuves pour résister aux contestations. Le groupe quitte le Centre ou est retrouvé après la diffusion.",
      "epilogue": [
        "À 00 h 07, les premières copies du dossier apparaissent sur plusieurs serveurs publics. Les noms protégés peuvent être masqués si le groupe a préparé une version expurgée.",
        "Dans les jours suivants, l’institution nie d’abord l’authenticité des documents, puis suspend plusieurs responsables. Les joueurs ne sont pas tous considérés comme des héros : certains secrets publiés laissent des blessures impossibles à effacer."
      ]
    },
    {
      "id": "duo_truth",
      "title": "Deux versions, une vérité",
      "icon": "◑",
      "conditions": [
        "Exactement 2 joueurs",
        "Aucune trahison ciblée entre eux",
        "Les deux refusent de partir seuls",
        "Une preuve authentique conservée"
      ],
      "summary": "Les deux joueurs refusent de laisser l’autre porter seul la vérité. Ils réunissent leurs fragments et sortent avec une version commune.",
      "epilogue": [
        "L’ascenseur refuse d’abord le second badge. Les deux joueurs bloquent les portes et assemblent leurs fragments devant la caméra. Le système reconnaît alors la cohérence des deux versions et ouvre le tunnel de service.",
        "Le dossier publié porte leurs deux signatures. Aucune version ne peut être attribuée à une seule personne, ce qui empêche l’organisation d’en isoler une pour la discréditer."
      ]
    },
    {
      "id": "silence_pact",
      "title": "Le pacte du silence",
      "icon": "🤫",
      "conditions": [
        "Tous ou presque tous sortent",
        "Preuves cachées ou version expurgée non publiée",
        "Décision collective de protéger les identités"
      ],
      "summary": "Le groupe sort avec la vérité, mais choisit de ne pas la rendre publique. Les preuves deviennent une assurance plutôt qu’une révélation.",
      "epilogue": [
        "Le Centre Valmont ferme ses portes derrière eux. Chacun possède un fragment, mais personne n’a la totalité. Ils jurent de ne publier qu’en cas de menace.",
        "Quelques semaines plus tard, une enveloppe contenant la page 17 arrive chez chacun. Personne n’admet l’avoir envoyée. Le pacte tient, mais la vérité continue de circuler dans l’ombre."
      ]
    },
    {
      "id": "scapegoat",
      "title": "Le bouc émissaire",
      "icon": "⚖️",
      "conditions": [
        "Une accusation forte ou une preuve fabriquée",
        "Une personne reste enfermée, perd ses accès ou est livrée à la sécurité"
      ],
      "summary": "Le Centre accepte un coupable. Les autres obtiennent une sortie, mais la vérité officielle repose sur une personne sacrifiée.",
      "epilogue": [
        "Les portes s’ouvrent dès que le nom est enregistré. Une personne reste derrière la vitre, entourée par les dossiers qui ont servi à la condamner.",
        "La version officielle explique tout par son action individuelle. Ceux qui sortent savent que l’histoire est fausse, même lorsque la personne accusée était réellement liée au dossier."
      ]
    },
    {
      "id": "false_file",
      "title": "Le faux dossier",
      "icon": "🪞",
      "conditions": [
        "Preuves modifiées ou contradictions élevées",
        "Publication réussie",
        "Authenticité insuffisante"
      ],
      "summary": "Une version du dossier est publiée, mais elle contient assez de falsifications pour être détruite publiquement.",
      "epilogue": [
        "Pendant quelques heures, le dossier 42 provoque une onde de choc. Puis les incohérences apparaissent : une date impossible, une page déplacée, une séquence vidéo coupée.",
        "L’organisation utilise ces erreurs pour déclarer l’ensemble frauduleux. La vraie preuve, mélangée au faux, devient plus difficile à défendre qu’avant l’entrée dans le Centre."
      ]
    },
    {
      "id": "single_copy",
      "title": "Une seule copie",
      "icon": "💾",
      "conditions": [
        "Une personne quitte avec la copie unique",
        "Pas de diffusion collective exploitable"
      ],
      "summary": "Une seule personne sort avec la vérité complète. Elle choisira plus tard de la vendre, la publier ou l’enterrer.",
      "epilogue": [
        "Le support de données tient dans une poche. Lorsque les portes se ferment, personne ne sait encore si la personne qui le possède respectera ses promesses.",
        "Les autres ne disposent que de souvenirs et de fragments. Leur confiance dans la dernière détentrice du dossier devient la véritable issue de la partie."
      ]
    },
    {
      "id": "mirror_operation",
      "title": "L’Opération Miroir",
      "icon": "👁️",
      "conditions": [
        "Caméras restaurées",
        "Alerte élevée",
        "Identités personnelles exposées",
        "Le système conserve le contrôle final"
      ],
      "summary": "Le Centre n’était pas seulement un lieu d’archives. Il testait la manière dont le groupe mentait, accusait et coopérait.",
      "epilogue": [
        "Les portes s’ouvrent sur une salle d’observation occupée. Des dizaines d’écrans rejouent chaque promesse, chaque mensonge et chaque hésitation.",
        "Une voix annonce que le dossier 42 n’était qu’une partie de l’expérience. Certains joueurs reçoivent une proposition. D’autres découvrent que leurs identités ont déjà été ajoutées à un nouveau dossier."
      ]
    },
    {
      "id": "archives_erased",
      "title": "Les archives s’effacent",
      "icon": "◼️",
      "conditions": [
        "Preuves ≤ 1 ou destruction finale",
        "Purge arrivée à son terme",
        "Aucune copie authentique restante"
      ],
      "summary": "Le dossier 42 disparaît. Les joueurs peuvent sortir, mais la vérité n’existe plus que dans leurs récits contradictoires.",
      "epilogue": [
        "À minuit exactement, les serveurs s’éteignent. Les dossiers papier prennent feu dans des compartiments scellés. Les portes s’ouvrent lorsque le bâtiment n’a plus rien à protéger.",
        "Dehors, chacun raconte une version différente. Sans preuve, les mensonges et les souvenirs ont le même poids. Le Centre Valmont redevient un bâtiment vide avant l’arrivée des autorités."
      ]
    }
  ],
  "branchRules": [
    {
      "after": "choose_archive",
      "routes": {
        "judicial": [
          "wing_judicial"
        ],
        "medical": [
          "wing_medical"
        ],
        "financial": [
          "wing_financial"
        ]
      }
    },
    {
      "after": "search_formation",
      "routes": {
        "together": [
          "search_together"
        ],
        "split": [
          "search_split"
        ],
        "lone": [
          "search_lone"
        ]
      }
    },
    {
      "after": "tribunal",
      "routes": {
        "false": [
          "verdict_false"
        ],
        "correct": [
          "verdict_correct"
        ],
        "unresolved": [
          "verdict_unresolved"
        ]
      }
    },
    {
      "after": "central_system",
      "routes": {
        "broadcast": [
          "system_broadcast"
        ],
        "unlock": [
          "system_unlock"
        ],
        "cameras": [
          "system_cameras"
        ]
      }
    }
  ],
  "designNotes": [
    "La présence d’une taupe n’est jamais annoncée.",
    "Les joueurs doivent parler à voix haute avant 24 scènes.",
    "Les trahisons ciblées restent invisibles jusqu’à leur découverte ou au bilan.",
    "Les joueurs à zéro vie poursuivent la partie via un parcours secret.",
    "Les branches convergent pour rester maintenables, mais modifient preuves, objets, suspects et routes finales."
  ]
};
