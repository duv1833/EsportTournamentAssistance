import React from 'react';
import TactileButton from '../common/TactileButton';

export default function JoinTeamModal({ joinTeamModal, setJoinTeamModal, handleJoinTeamFromTournament, isTournamentLoading }) {
  if (!joinTeamModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface-charcoal border border-outline-variant p-6 w-full max-w-md clip-corner relative shadow-2xl">
        <button 
          onClick={() => setJoinTeamModal({ isOpen: false, teamId: null, inGameName: '' })}
          className="absolute top-4 right-4 text-tactical-gray hover:text-primary-red transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 className="font-display text-xl text-off-white uppercase mb-2">Xin gia nhập đội</h3>
        <p className="font-mono text-xs text-tactical-gray mb-6">Vui lòng cung cấp tên In-game để đội trưởng có thể nhận diện bạn.</p>
        
        <form onSubmit={handleJoinTeamFromTournament}>
          <div className="mb-6">
            <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Tên In-game</label>
            <input
              type="text"
              className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
              placeholder="VD: SofM#VN2"
              value={joinTeamModal.inGameName}
              onChange={(e) => setJoinTeamModal({ ...joinTeamModal, inGameName: e.target.value })}
              required
              autoFocus
            />
          </div>
          <TactileButton 
            type="submit"
            disabled={isTournamentLoading}
            className="w-full bg-primary-red hover:bg-primary-red/90 text-off-white font-mono text-sm py-3 uppercase font-bold tracking-wider"
          >
            {isTournamentLoading ? 'Đang gửi...' : 'Xác nhận gia nhập'}
          </TactileButton>
        </form>
      </div>
    </div>
  );
}
