-- Delete events on a filtered postgres_changes subscription (stevneid=eq.X) only match
-- when the old row includes stevneid; default replica identity only carries the PK (id).
alter table pamelding replica identity full;
