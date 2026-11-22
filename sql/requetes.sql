-- =============================================================================
-- PARTIE A · Question 3 · Six requetes
-- Sous chaque question : votre requete, puis le resultat obtenu, en commentaire.
-- =============================================================================

-- R1. Les commentaires de l'article 2, du plus recent au plus ancien : nom, texte.
SELECT commentaires.nom, commentaires.texte
FROM commentaires
WHERE article_id = 2
ORDER BY cree_le DESC;

/*
"nom"	"texte"
"Inès"	"Des photos de la pose seraient les bienvenues."
"Hugo"	"Le noyer est magnifique. Combien de temps pour le séchage ?"
*/

-- R2. Le nombre de commentaires de CHAQUE article, y compris ceux qui n'en ont aucun :
--     id, titre, nb_commentaires.

SELECT articles.id, articles.titre, COUNT(commentaires.id) AS nb_commentaires
FROM articles
LEFT JOIN commentaires ON commentaires.article_id = articles.id
GROUP BY articles.id, articles.titre
ORDER BY articles.id;

/*
"id"	"titre"	"nb_commentaires"
1	"Choisir son bois pour une table de jardin"	3
2	"Une bibliothèque sur mesure à Besançon"	2
3	"Huile ou vernis : ce qui protège vraiment"	0
4	"Restaurer une chaise paillée"	1
5	"Une cuisine en chêne massif à Dole"	2
6	"Affûter ses ciseaux à bois"	0
*/

-- R3. Les articles qui n'ont aucun commentaire : id, titre.

SELECT articles.id, articles.titre
FROM articles
WHERE NOT EXISTS (
    SELECT 1 
    FROM commentaires 
    WHERE commentaires.article_id = articles.id
    )
ORDER BY articles.id;

/*
"id"	"titre"
3	"Huile ou vernis : ce qui protège vraiment"
6	"Affûter ses ciseaux à bois"
*/

-- R4. Pour chaque auteur, le nombre total de commentaires recus sur ses articles,
--     du plus commente au moins commente.

SELECT auteurs.prenom AS auteur, COUNT(commentaires.id) AS nb_commentaires
FROM auteurs
LEFT JOIN articles ON auteurs.id = articles.auteur_id
LEFT JOIN commentaires ON commentaires.article_id = articles.id
GROUP BY auteurs.id, auteurs.prenom
ORDER BY nb_commentaires DESC, auteurs.prenom;

/*
"auteur"	"nb_commentaires"
"Marc"	5
"Théo"	2
"Sophie"	1
*/

-- R5. Les visiteurs (nom) qui ont commente plus d'un article.

SELECT commentaires.nom
FROM commentaires
GROUP BY nom
HAVING COUNT(DISTINCT article_id) > 1;

/*
"nom"
"Claire"
*/

-- R6. Les trois commentaires les plus recents, avec le titre de leur article.

SELECT commentaires.nom, commentaires.texte, articles.titre
FROM commentaires
JOIN articles ON articles.id = commentaires.article_id
ORDER BY commentaires.cree_le DESC
LIMIT 3;

/*
"nom"	"texte"	"titre"
"Karim"	"Superbe travail."	"Une cuisine en chêne massif à Dole"
"Claire"	"Aucune vis visible : comment sont fixés les caissons ?"	"Une cuisine en chêne massif à Dole"
"Lucie"	"J'ai une chaise à faire refaire, vous prenez les commandes ?"	"Restaurer une chaise paillée"
*/
