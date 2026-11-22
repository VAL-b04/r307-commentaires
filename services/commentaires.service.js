// SERVICE des commentaires · VERSION POSTGRESQL.
// Il respecte le meme contrat que la version JSON (CONTRAT.md) : memes fonctions, memes reponses.
// Le routeur et le controleur n'ont donc pas a changer.
//
// Les valeurs ne sont JAMAIS collees dans le texte SQL : elles passent par $1, $2...

const pool = require('../db/pool');
const ErreurHttp = require('../utils/erreur-http');

// Les colonnes d'un commentaire, avec les noms du contrat.
const COLONNES = 'id, article_id, nom, texte, cree_le';

const introuvable = (id) => new ErreurHttp(404, 'COMMENTAIRE_INTROUVABLE', `Le commentaire ${id} n'existe pas.`);
const articleIntrouvable = (id) => new ErreurHttp(404, 'ARTICLE_INTROUVABLE', `L'article ${id} n'existe pas.`);

// Une erreur de PostgreSQL a un code a cinq caracteres. 23514 : une contrainte CHECK refuse
// la valeur (un texte vide). Les autres restent des erreurs 500.
function traduire(err)
{
  if (err.code === '23514') return new ErreurHttp(400, 'VALEUR_REFUSEE', `Valeur refusée par la base (${err.constraint}).`);
  return err;
}

// READ · les commentaires d'un article, du plus ancien au plus recent
async function lister(articleId)
{
  if (!Number.isInteger(articleId)) throw articleIntrouvable(articleId);
  const article = await pool.query('SELECT 1 FROM articles WHERE id = $1', [articleId]);
  if (article.rowCount === 0) throw articleIntrouvable(articleId);
  const resultat = await pool.query(
    `SELECT ${COLONNES} FROM commentaires WHERE article_id = $1 ORDER BY cree_le, id`,
    [articleId],
  );
  return resultat.rows;
}

// READ · un commentaire
async function trouver(id)
{
  if (!Number.isInteger(id)) throw introuvable(id);
  const resultat = await pool.query(`SELECT ${COLONNES} FROM commentaires WHERE id = $1`, [id]);
  if (resultat.rowCount === 0) throw introuvable(id);
  return resultat.rows[0];
}

// READ · les commentaires d'un visiteur, du plus recent au plus ancien, avec le titre de l'article
async function parVisiteur(nom)
{
  const resultat = await pool.query(
    `SELECT c.id, c.article_id, c.nom, c.texte, c.cree_le, a.titre
     FROM commentaires c
     JOIN articles a ON a.id = c.article_id
     WHERE c.nom = $1
     ORDER BY c.cree_le DESC, c.id DESC`,
    [nom],
  );
  return resultat.rows;
}

// CREATE · si l'article n'existe pas, la cle etrangere refuse : code 23503
async function creer(articleId, { nom, texte })
{
  if (!Number.isInteger(articleId)) throw articleIntrouvable(articleId);
  try
  {
    const resultat = await pool.query(
      `INSERT INTO commentaires (article_id, nom, texte) VALUES ($1, $2, $3) RETURNING ${COLONNES}`,
      [articleId, nom, texte],
    );
    return resultat.rows[0];
  }
  catch (err)
  {
    if (err.code === '23503') throw articleIntrouvable(articleId);
    throw traduire(err);
  }
}

// UPDATE · le texte seulement ; RETURNING rend directement le commentaire modifie
async function modifier(id, { texte })
{
  if (!Number.isInteger(id)) throw introuvable(id);
  try {
    const resultat = await pool.query(
      `UPDATE commentaires SET texte = $2 WHERE id = $1 RETURNING ${COLONNES}`,
      [id, texte],
    );
    if (resultat.rowCount === 0) throw introuvable(id);
    return resultat.rows[0];
  } catch (err) {
    throw traduire(err);
  }
}

// DELETE
async function supprimer(id)
{
  if (!Number.isInteger(id)) throw introuvable(id);
  const resultat = await pool.query('DELETE FROM commentaires WHERE id = $1', [id]);
  if (resultat.rowCount === 0) throw introuvable(id);
}

module.exports = { lister, trouver, parVisiteur, creer, modifier, supprimer };
