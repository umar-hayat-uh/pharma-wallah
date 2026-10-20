/** Props every lab's bench panel receives from LabExperience. */
export interface BenchProps<S, A> {
  s: S;
  act(a: A): void;
  stepId: string;
  done(stepId: string): boolean;
  /** Tell the room something is flowing/animating (e.g. the burette stopcock is open). */
  onFlow?(on: boolean): void;
}
