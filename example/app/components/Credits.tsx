import { Container } from '@/components/Container';
import { GithubIcon } from 'lucide-react';

export const Credits = () => {
  return (
    <Container className="pb-2">
      <div className="no-view-transition mt-2 flex items-center justify-center space-x-6">
        <p>
          <span>Made by </span>
          <a className="underline" target="_blank" href="https://akhmadshin.dev">akhmadshin.dev</a>
        </p>
        <a href="https://github.com/akhmadshin/view-transition-name-handler" target="_blank">
          <div>
            <code className="pr-2">view-transition-name-handler</code>
            <GithubIcon className="h-[1.2rem] w-[1.2rem] inline"/>
          </div>
        </a>
      </div>
    </Container>
  )
}