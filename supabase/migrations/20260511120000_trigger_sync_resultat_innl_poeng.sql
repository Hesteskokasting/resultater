CREATE OR REPLACE FUNCTION _sync_innl_poeng(p_kasterid integer, p_stevneid integer)
RETURNS void AS $$
BEGIN
  UPDATE resultat
  SET
    kamp_poeng_innl = (
      SELECT COALESCE(SUM(ks.kamp_poeng), 0)
      FROM kamp_spelar ks
      JOIN kamp k ON k.id = ks.kampid
      WHERE ks.kasterid = p_kasterid
        AND k.stevneid = p_stevneid
        AND k.fase = 'innledende'
        AND k.er_bekreftet = true
    ),
    score_poeng_innl = (
      SELECT COALESCE(SUM(ks.score_poeng), 0)
      FROM kamp_spelar ks
      JOIN kamp k ON k.id = ks.kampid
      WHERE ks.kasterid = p_kasterid
        AND k.stevneid = p_stevneid
        AND k.fase = 'innledende'
        AND k.er_bekreftet = true
    )
  WHERE stevneid = p_stevneid
    AND kasterid = p_kasterid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_kamp_spelar_sync_innl()
RETURNS TRIGGER AS $$
DECLARE
  v_stevneid integer;
  v_fase text;
BEGIN
  SELECT k.stevneid, k.fase INTO v_stevneid, v_fase
  FROM kamp k WHERE k.id = COALESCE(NEW.kampid, OLD.kampid);

  IF v_fase != 'innledende' THEN RETURN COALESCE(NEW, OLD); END IF;

  IF NEW IS NOT NULL THEN
    PERFORM _sync_innl_poeng(NEW.kasterid, v_stevneid);
  END IF;
  IF OLD IS NOT NULL AND (NEW IS NULL OR OLD.kasterid != NEW.kasterid) THEN
    PERFORM _sync_innl_poeng(OLD.kasterid, v_stevneid);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kamp_spelar_sync_innl_poeng
AFTER INSERT OR UPDATE OR DELETE ON kamp_spelar
FOR EACH ROW EXECUTE FUNCTION trg_kamp_spelar_sync_innl();

CREATE OR REPLACE FUNCTION trg_kamp_sync_innl()
RETURNS TRIGGER AS $$
DECLARE r record;
BEGIN
  IF NEW.fase != 'innledende' THEN RETURN NEW; END IF;
  IF OLD.er_bekreftet IS NOT DISTINCT FROM NEW.er_bekreftet THEN RETURN NEW; END IF;

  FOR r IN SELECT kasterid FROM kamp_spelar WHERE kampid = NEW.id LOOP
    PERFORM _sync_innl_poeng(r.kasterid, NEW.stevneid);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kamp_sync_innl_poeng
AFTER UPDATE OF er_bekreftet ON kamp
FOR EACH ROW EXECUTE FUNCTION trg_kamp_sync_innl();
