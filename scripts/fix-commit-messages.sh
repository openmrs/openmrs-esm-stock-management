#!/bin/bash

# Function to standardize commit message
standardize_commit() {
    local msg="$1"

    # Convert to lowercase and remove parentheses
    msg=$(echo "$msg" | tr '[:upper:]' '[:lower:]' | sed 's/^(//;s/)$//')

    # Standardize types
    msg=$(echo "$msg" | sed -E 's/^(ft|feature):/\1eat:/')
    msg=$(echo "$msg" | sed -E 's/^(bug|fix):/\1ix:/')

    # Add space after colon if missing
    msg=$(echo "$msg" | sed 's/:/: /')

    # Remove trailing period
    msg=$(echo "$msg" | sed 's/\.$//')

    # Convert first word to present tense if it's a past tense verb
    msg=$(echo "$msg" | sed -E 's/^(feat|fix|docs|test|refactor): (added|fixed|updated|removed|changed|modified)/\1: add|fix|update|remove|change|modify/')

    echo "$msg"
}

# Get all commit hashes
git log --pretty=format:"%H" | while read -r commit_hash; do
    # Get the commit message
    commit_msg=$(git log -1 --pretty=format:"%s" $commit_hash)

    # Standardize the commit message
    new_msg=$(standardize_commit "$commit_msg")

    # Update the commit message
    git filter-branch -f --msg-filter "if [ \$GIT_COMMIT = '$commit_hash' ]; then echo '$new_msg'; else cat; fi" HEAD^..HEAD
done
