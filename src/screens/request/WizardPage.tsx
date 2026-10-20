import type { ReactNode } from 'react';
import { Page } from '../../components/Layout';
import { useRequest } from '../../state/request';
import { Progress, Stepper } from './steps';

type Props = { step: number; title: string; heading?: ReactNode; back: string; screenKey: string; children: ReactNode };

/** Pantalla de un paso: barra de avance en celular y columna de pasos en computador. */
export function WizardPage({ step, title, heading, back, screenKey, children }: Props) {
  const { draft } = useRequest();
  return (
    <Page
      title={title}
      heading={heading}
      back={back}
      screenKey={screenKey}
      className="wide"
      before={<Progress step={step} />}
      aside={<Stepper step={step} draft={draft} />}
    >
      {children}
    </Page>
  );
}
