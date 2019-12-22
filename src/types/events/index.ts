export * from './base-events';
import { SlackEvent, BasicSlackEvent } from './base-events';
import { StringIndexed } from '../helpers';
import { SayFn } from '../utilities';
import { WebClient } from '@slack/web-api';

/**
 * Arguments which listeners and middleware receive to process an event from Slack's Events API.
 */
export interface SlackEventMiddlewareArgs<EventType extends string = string> {
  payload: EventFromType<EventType>;
  event: this['payload'];
  message: EventType extends 'message' ? this['payload'] : never;
  body: EnvelopedEvent<this['payload']>;
  say: WhenEventHasChannelContext<this['payload'], SayFn>;
  client: WebClient;
}

/**
 * A Slack Events API event wrapped in the standard envelope.
 *
 * This describes the entire JSON-encoded body of a request from Slack's Events API.
 */
interface EnvelopedEvent<Event = BasicSlackEvent> extends StringIndexed {
  token: string;
  team_id: string;
  enterprise_id?: string;
  api_app_id: string;
  event: Event;
  type: 'event_callback';
  event_id: string;
  event_time: number;
  // TODO: is this optional?
  authed_users: string[];
}

/**
 * Type function which given a string `T` returns a type for the matching Slack event(s).
 *
 * When the string matches known event(s) from the `SlackEvent` union, only those types are returned (also as a union).
 * Otherwise, the `BasicSlackEvent<T>` type is returned.
 */
type EventFromType<T extends string> = KnownEventFromType<T> extends never ? BasicSlackEvent<T> : KnownEventFromType<T>;
type KnownEventFromType<T extends string> = Extract<SlackEvent, { type: T }>;

/**
 * Type function which tests whether or not the given `Event` contains a channel ID context for where the event
 * occurred, and returns `Type` when the test passes. Otherwise this returns `never`.
 */
type WhenEventHasChannelContext<Event, Type> =
  Event extends ({ channel: string; } | { item: { channel: string; }; }) ? Type : never;
