"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus, IconTrash, IconPencil } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AvailabilityRuleForm } from "@/components/availability/availability-rule-form";
import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  listAvailabilityRules,
  updateAvailabilityRule,
  type AvailabilityRule,
  type AvailabilityRuleInput,
} from "@/lib/availability";

export default function AvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<
    { mode: "create" } | { mode: "edit"; rule: AvailabilityRule } | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listAvailabilityRules();
      setRules(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load availability rules",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  async function handleCreate(input: AvailabilityRuleInput) {
    await createAvailabilityRule(input);
    setDialogState(null);
    await loadRules();
  }

  async function handleUpdate(id: string, input: AvailabilityRuleInput) {
    await updateAvailabilityRule(id, input);
    setDialogState(null);
    await loadRules();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this availability rule?")) return;
    setDeletingId(id);
    try {
      await deleteAvailabilityRule(id);
      await loadRules();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to delete rule");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Availability</h1>
          <p className="mt-2 text-muted-foreground">
            Define open hours and slot capacity for each area.
          </p>
        </div>
        <Button onClick={() => setDialogState({ mode: "create" })}>
          <IconPlus className="size-4" />
          New rule
        </Button>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Rules</CardTitle>
          <CardDescription>
            {rules.length} area{rules.length === 1 ? "" : "s"} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadError && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {loadError}
            </p>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading rules…</p>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No availability rules yet. Create one to start accepting reservations.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Party size</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.areaName}</TableCell>
                    <TableCell>
                      {rule.dayStartTime.slice(0, 5)}–{rule.dayEndTime.slice(0, 5)}
                    </TableCell>
                    <TableCell>{rule.slotDurationMinutes} min</TableCell>
                    <TableCell>
                      {rule.minCapacityPerSlot}–{rule.maxCapacityPerSlot}
                    </TableCell>
                    <TableCell>{rule.ruleExpiredDate ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDialogState({ mode: "edit", rule })}
                        >
                          <IconPencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={deletingId === rule.id}
                          onClick={() => handleDelete(rule.id)}
                        >
                          <IconTrash className="size-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState?.mode === "edit" ? "Edit rule" : "New availability rule"}
            </DialogTitle>
            <DialogDescription>
              Set the hours and capacity customers can book for this area.
            </DialogDescription>
          </DialogHeader>
          {dialogState && (
            <AvailabilityRuleForm
              initial={dialogState.mode === "edit" ? dialogState.rule : undefined}
              onCancel={() => setDialogState(null)}
              onSubmit={(input) =>
                dialogState.mode === "edit"
                  ? handleUpdate(dialogState.rule.id, input)
                  : handleCreate(input)
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
