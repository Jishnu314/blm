import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { uid } from "./helpers";

const EMPTY_TEAM = { self: null, customers: [], agents: [], schemes: [] };

export function useCloudStore() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = still checking, null = logged out
  const [profile, setProfile] = useState(null); // { teamId, role: "self" | "agent", memberId? }
  const [data, setData] = useState(EMPTY_TEAM);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  // 1. Track login state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAuthUser(session?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2. Once logged in, find out which team this login belongs to
  useEffect(() => {
    if (authUser === undefined) return;
    if (authUser === null) {
      setProfile(null);
      setData(EMPTY_TEAM);
      setLoaded(true);
      return;
    }
    (async () => {
      const { data: row, error } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
      if (error) console.error("profile load failed", error);
      setProfile(row ? { teamId: row.team_id, role: row.role, memberId: row.member_id } : null);
    })();
  }, [authUser]);

  // 3. Load the shared team row, then subscribe to live updates
  useEffect(() => {
    if (!profile?.teamId) {
      setLoaded(authUser !== undefined);
      return;
    }
    let active = true;

    (async () => {
      const { data: row, error } = await supabase.from("teams").select("data").eq("id", profile.teamId).maybeSingle();
      if (error) console.error("team load failed", error);
      if (active) {
        if (row) setData((d) => ({ ...d, ...row.data }));
        setLoaded(true);
      }
    })();

    const channel = supabase
      .channel(`team-${profile.teamId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams", filter: `id=eq.${profile.teamId}` },
        (payload) => {
          if (payload.new?.data) setData((d) => ({ ...d, ...payload.new.data }));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [profile?.teamId]);

  const persist = (next) => {
    if (!profile?.teamId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase
        .from("teams")
        .update({ data: next })
        .eq("id", profile.teamId)
        .then(({ error }) => {
          if (error) console.error("cloud save failed", error);
        });
    }, 250);
  };

  const update = (fn) => {
    setData((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      persist(next);
      return next;
    });
  };

  // Create a brand-new team — this login becomes "self" (the team owner).
  // The team's row id IS this user's auth uid, which doubles as the "team code" for inviting agents.
  const createTeam = async ({ email, password, name, rank, agentIdNumber, phone }) => {
    const { data: signUp, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const teamId = signUp.user?.id;
    if (!teamId) throw new Error("Account created, but no active session came back — check your Supabase email-confirmation setting.");

    const selfRecord = { id: teamId, name, rank, agentIdNumber, phone, email, authUid: teamId, isSelf: true };
    const { error: teamErr } = await supabase.from("teams").insert({ id: teamId, data: { ...EMPTY_TEAM, self: selfRecord } });
    if (teamErr) throw teamErr;
    const { error: profErr } = await supabase.from("profiles").insert({ id: teamId, team_id: teamId, role: "self" });
    if (profErr) throw profErr;
    return teamId; // show this to the user as their team code
  };

  // Join an existing team using the team code the owner shared with you
  const joinTeam = async ({ email, password, name, rank, agentIdNumber, phone, teamCode }) => {
    const { data: teamRow, error: teamErr } = await supabase.from("teams").select("data").eq("id", teamCode).maybeSingle();
    if (teamErr || !teamRow) throw new Error("That team code doesn't match any team.");

    const { data: signUp, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const userId = signUp.user?.id;
    if (!userId) throw new Error("Account created, but no active session came back — check your Supabase email-confirmation setting.");

    const newAgent = { id: uid(), name, rank, agentIdNumber, phone, email, authUid: userId, payments: [] };
    const nextData = { ...teamRow.data, agents: [...(teamRow.data.agents || []), newAgent] };
    const { error: updErr } = await supabase.from("teams").update({ data: nextData }).eq("id", teamCode);
    if (updErr) throw updErr;
    const { error: profErr } = await supabase.from("profiles").insert({ id: userId, team_id: teamCode, role: "agent", member_id: newAgent.id });
    if (profErr) throw profErr;
  };

  const logIn = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logOut = () => supabase.auth.signOut();

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return { authUser, profile, data, update, loaded, createTeam, joinTeam, logIn, logOut, resetPassword };
}