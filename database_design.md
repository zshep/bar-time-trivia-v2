# Trivia App Database Design

## Collections

*   **games**
    *   `game_id` (string, document ID)
    *   `game_name` (string)
    *   `game_description` (string)
    *   `created_by` (reference to `users` document)
    *   `rounds` (array of round objects)

*   **users**
    *   `user_id` (string, document ID)
    *   `user_name` (string)
    *   `email` (string)
    *   `avatar` (string)
    *   `number_wins` (number)

*   **sessions**
    *   `session_id` (string, document ID)
    *   `game_id` (reference to `games` document)
    *   `host_id` (reference to `users` document)
    *   `join_code` (string)
    *   `participants` (array of user IDs or references)

## Relationships

*   Games have one-to-many relationships with rounds (nested within the game document).
*   Sessions have a one-to-one relationship with games.
*   Sessions have a many-to-many relationship with users (participants).

## Example Game Document

```json
{
  "game_id": "some_game_id",
  "game_name": "My Fun Trivia",
  "game_description": "A quiz about everything!",
  "created_by": "user_id_123",
  "rounds": [
    {
      "round_name": "Round 1",
      // ... other round data
    }
  ]
}